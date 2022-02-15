import { Container, Row } from "react-bootstrap";
import HeaderBar from "../components/HeaderBar";
import SinglePageDashboard from "../components/SinglePageDashbaord";
import { RouteInfo } from "../index";

type SinglePageProps = {
  routes: RouteInfo[];
};

function SinglePage(props: SinglePageProps) {
  return (
    <Container fluid>
      <Row>
        <HeaderBar routes={props.routes} />
      </Row>
      <Row>
        <SinglePageDashboard />
      </Row>
    </Container>
  );
}

export default SinglePage;
