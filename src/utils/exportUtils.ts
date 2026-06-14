export function saveCanvasAsImage(
  canvas: HTMLCanvasElement,
  filename: string = "sand-art.png",
): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getGLCanvas(container: HTMLElement): HTMLCanvasElement | null {
  return container.querySelector("canvas");
}
