let currentPort = 4000;

export function getNextPort() {
  return currentPort++;
}