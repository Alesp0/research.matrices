import BoundingBox from "./BoundingBox";

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

export default TextDetectionResponseData;
