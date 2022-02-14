import ListGroup from "react-bootstrap/ListGroup";

type AnnotationListProps = {
  annotations: string[];
};

function AnnotationList(props: AnnotationListProps) {
  const elems = props.annotations.map((elem, index) => {
    return (
      <ListGroup.Item as="li" key={index}>
        {elem}
      </ListGroup.Item>
    );
  });
  return (
    <ListGroup as="ol" numbered={true}>
      {elems}
    </ListGroup>
  );
}

export default AnnotationList;
