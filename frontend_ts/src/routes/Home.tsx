import { RouteInfo } from "../index";
import HeaderBar from "../components/HeaderBar";

type HomeProps = {
  routes: RouteInfo[];
};

function Home(props: HomeProps) {
  return (
    <HeaderBar
      routes={props.routes}
    />
  );
}

export default Home;
