import ListGroup from "react-bootstrap/ListGroup";

type AnnotationListProps = {
  annotations: string[];
  listMaxheight: number;
};

function AnnotationList(props: AnnotationListProps) {
  const elems = props.annotations.map((elem, index) => {
    return (
      <ListGroup.Item as="li" variant="flush" key={index}>
        {elem}
      </ListGroup.Item>
    );
  });

  const maxHeight = `${props.listMaxheight}px`;

  return (
    <ListGroup
      as="ol"
      numbered={true}
      variant="flush"
      className="overflow-auto"
      style={{ maxHeight: maxHeight }}
    >
      {elems}
    </ListGroup>
  );
}

export default AnnotationList;
