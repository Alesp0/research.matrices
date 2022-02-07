class BoundingBox {
  id: string;
  height: number;
  width: number;
  x: number;
  y: number;

  constructor(id: string, height: number, width: number, x: number, y: number) {
    this.id = id;
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;
  }

  static fromJson(jsonData: any) {
    const id = String(jsonData.id);
    const height = Number.parseInt(jsonData.height);
    const width = Number.parseInt(jsonData.width);
    const x = Number.parseInt(jsonData.x);
    const y = Number.parseInt(jsonData.y);

    if (
      id.length === 0 ||
      isNaN(height) ||
      isNaN(width) ||
      isNaN(x) ||
      isNaN(y)
    ) {
      return null;
    } else {
      return new BoundingBox(id, height, width, x, y);
    }
  }
}

class TextDetectionResponseData {
  boundingBoxes: BoundingBox[];
  height: number;
  width: number;

  constructor(boxes: BoundingBox[], height: number, width: number) {
    this.boundingBoxes = boxes;
    this.height = height;
    this.width = width;
  }

  static fromJson(jsonData: any) {
    const boxes = jsonData["bounding_box"];
    const height = jsonData.height;
    const width = jsonData.width;

    const parsedHeight = Number.parseInt(height);
    const parsedWidth = Number.parseInt(width);

    if (isNaN(parsedHeight) || isNaN(parsedWidth) || !Array.isArray(boxes)) {
      return null;
    } else {
      const parsedBoxes = [];
      for (const box of boxes) {
        const parsed = BoundingBox.fromJson(box);
        if (parsed) {
          parsedBoxes.push(parsed);
        } else {
          return null;
        }
      }

      return new TextDetectionResponseData(
        parsedBoxes,
        parsedHeight,
        parsedWidth
      );
    }
  }
}

export { TextDetectionResponseData, BoundingBox };
