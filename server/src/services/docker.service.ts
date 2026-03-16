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

  export async function runProjectContainer(projectId: string, port: number) {

    const container = await docker.createContainer({
      Image: `justsay-project-${projectId}`,
      ExposedPorts: {
        "5173/tcp": {}
      },
      HostConfig: {
        PortBindings: {
          "5173/tcp": [{ HostPort: port.toString() }]
        }
      }
    });
  
    await container.start();
  
    return container.id;
  }

export default docker;