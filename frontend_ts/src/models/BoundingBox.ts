import { v4 as uuidv4 } from "uuid";

class BoundingBox {
  id: string;
  height: number;
  width: number;
  x: number;
  y: number;
  rotation: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number
  ) {
    if (x < 0) {
      x = 0;
    }
    if (y < 0) {
      y = 0;
    }

    this.id = uuidv4();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
  }

  getCenter() {
    const x = this.x + this.width / 2;
    const y = this.y + this.height / 2;

    return { x, y };
  }

  static sortBoxes(boxes: BoundingBox[]) {
    const sorted = boxes.sort((a, b) => {
      const aCenter = a.getCenter();
      const bCenter = b.getCenter();

      if (aCenter.y - bCenter.y === 0) {
        return aCenter.x - bCenter.y;
      } else {
        return aCenter.y - bCenter.y;
      }
    });
    return sorted;
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
      return new BoundingBox(x, y, width, height, 0);
    }
  }
}

export default BoundingBox;
