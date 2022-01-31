import { LinkContainer } from "react-router-bootstrap";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";

import icon from "../assets/favicon.png";
import { RouteInfo } from "../index";

type HeaderBarProps = {
  routes: RouteInfo[];
};

function HeaderBar(props: HeaderBarProps) {
  const navItems = props.routes.map((route, index) => {
    return (
      <Nav.Item key={index}>
        <LinkContainer to={route.path}>
          <Nav.Link>{route.description}</Nav.Link>
        </LinkContainer>
      </Nav.Item>
    );
  });

  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand>
          <img
            alt=""
            width="38"
            height="38"
            src={icon}
            className="d-inline-block align-top"
          />
          <span> HTR Service</span>
        </Navbar.Brand>
        <Nav>{navItems}</Nav>
      </Container>
    </Navbar>
  );
}

export default HeaderBar;
