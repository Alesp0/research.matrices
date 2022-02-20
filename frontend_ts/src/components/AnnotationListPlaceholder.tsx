import ListGroup from "react-bootstrap/ListGroup";
import Placeholder from "react-bootstrap/Placeholder";

type AnnotationListPlaceholderProps = {
  annotationsNumber: number;
  listMaxheight: number;
};

function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function AnnotationListPlaceholder(props: AnnotationListPlaceholderProps) {
  const maxHeight = `${props.listMaxheight}px`;
  const liPlacheholders = [];

  for (let i = 0; i < props.annotationsNumber; i++) {
    liPlacheholders.push(
      <ListGroup.Item variant="flush" key={i}>
        <Placeholder xs={randomIntFromInterval(3, 11)} />
      </ListGroup.Item>
    );
  }

  return (
    <ListGroup
      as="ol"
      numbered={true}
      variant="flush"
      className="overflow-auto"
      style={{ maxHeight: maxHeight }}
    >
      {liPlacheholders}
    </ListGroup>
  );
}

export default AnnotationListPlaceholder;
