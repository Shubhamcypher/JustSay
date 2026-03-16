import Docker from "dockerode";

const docker = new Docker({socketPath: "/var/run/docker.sock"});

export async function buildProjectImage(projectPath: string, projectId: string) {

    const stream = await docker.buildImage(
      {
        context: projectPath,
        src: ["."]
      },
      {
        t: `justsay-project-${projectId}`
      }
    );
  
    return stream;
  }

export default docker;