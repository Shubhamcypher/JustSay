import { pool } from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";
import { Request, Response } from "express";
import { generateReactTemplate } from "../services/ai.service";
import { writeProjectToDisk } from "../services/fileSystem.service";
import docker, { buildProjectImage, runProjectContainer } from "../services/docker.service";
import { getNextPort } from "../utils/port.util";

// export async function createProject(req: AuthRequest, res: Response) {
//   const { name, stack } = req.body;
//   if (!req.user) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   if (!name?.trim() || !stack?.trim()) {
//     return res.status(400).json({ message: "Invalid input" });
//   }

//   if (!name || !stack) {
//     return res.status(400).json({ message: "Invalid input" });
//   }

//   try {
//     const result = await pool.query(
//       `INSERT INTO projects (name, stack, status, owner_id)
//          VALUES ($1,$2,$3,$4)
//          RETURNING *`,
//       [name, stack, "stopped", req.user!.userId]
//     );

//     const project = result.rows[0];

//     // 👇 generate starter files
//     if (stack === "react") {
//       await generateReactTemplate(project.id);
//     }

//     res.status(201).json(project)

//   } catch (error) {
//     res.status(500).json({ message: "Failed to create project" });
//   }
// }
export async function createProject(req: AuthRequest, res: Response) {
  const { name, stack } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!name?.trim() || !stack?.trim()) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO projects (name, stack, status, owner_id)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [name, stack, "stopped", req.user.userId]
    );

    const project = result.rows[0];

    // generate files
    if (stack === "react") {
      await generateReactTemplate(project.id, client);
    }

    await client.query("COMMIT");

    res.status(201).json(project);

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("CREATE PROJECT ERROR:", error);

    res.status(500).json({ message: "Failed to create project" });

  } finally {
    client.release();
  }
}

export async function getProjects(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const result = await pool.query(
    "SELECT * FROM projects WHERE owner_id=$1 ORDER BY created_at DESC",
    [req.user!.userId]
  );

  res.json(result.rows);
}

export async function getProjectById(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const result = await pool.query(
    "SELECT * FROM projects WHERE id=$1 AND owner_id=$2",
    [id, req.user?.userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json(result.rows[0]);
}

export async function deleteProject(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const result = await pool.query(
    "DELETE FROM projects WHERE id=$1 AND owner_id=$2",
    [id, req.user?.userId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json({ message: "Project deleted" });
}

export async function startProject(req: AuthRequest, res: Response) {

  const projectId = req.params.id;
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    //check for project ownership
    const projectCheck = await pool.query(
      "SELECT * FROM projects WHERE id=$1 AND owner_id=$2",
      [projectId, req.user!.userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    //Check if container already running
    const existing = await pool.query(
      "SELECT * FROM containers WHERE project_id=$1 AND status='running'",
      [projectId]
    );

    if (existing.rows.length > 0) {
      return res.json({
        message: "Project already running",
        preview: `http://localhost:${existing.rows[0].port}`
      });
    }

    //before writing files
    await pool.query(
      "UPDATE projects SET status=$1 WHERE id=$2",
      ["building", projectId]
    );
    // 1️⃣ Write project files
    const projectPath = await writeProjectToDisk(projectId);

    // 2️⃣ Build docker image
    await buildProjectImage(projectPath, projectId);

    // 3️⃣ Allocate port
    const port = getNextPort();

    // 4️⃣ Run container
    const containerId = await runProjectContainer(projectId, port);

    //Insert into DB
    await pool.query(
      `INSERT INTO containers (project_id, container_id, port, status)
         VALUES ($1,$2,$3,$4)`,
      [projectId, containerId, port, "running"]
    );

    //Notify user project is running
    await pool.query(
      "UPDATE projects SET status=$1 WHERE id=$2",
      ["running", projectId]
    );

    // 5️⃣ Return preview URL
    res.json({
      message: "Project running",
      preview: `http://localhost:${port}`,
      containerId
    });

  } catch (error) {
    await pool.query(
      "UPDATE projects SET status=$1 WHERE id=$2",
      ["failed", projectId]
    );
    res.status(500).json({ message: "Failed to start project" });
    console.error("START PROJECT ERROR:", error);
  }
}


export async function stopProject(req: AuthRequest, res: Response) {

  const projectId = req.params.id;
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {

    // ✅ ownership check
    const projectCheck = await pool.query(
      "SELECT * FROM projects WHERE id=$1 AND owner_id=$2",
      [projectId, req.user!.userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      "SELECT container_id FROM containers WHERE project_id=$1 AND status='running'",
      [projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No running container" });
    }

    const containerId = result.rows[0].container_id;

    const container = docker.getContainer(containerId);

    // ✅ safe stop
    try {
      await container.stop();
    } catch { }

    // ✅ safe remove
    try {
      await container.remove();
    } catch { }

    await pool.query(
      "UPDATE containers SET status='stopped' WHERE container_id=$1",
      [containerId]
    );

    // ✅ update project status
    await pool.query(
      "UPDATE projects SET status=$1 WHERE id=$2",
      ["stopped", projectId]
    );

    res.json({
      message: "Project stopped",
      projectId,
      status: "stopped"
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to stop project" });
  }
}