import { RouteInfo } from "../index";
import HeaderBar from "../components/HeaderBar";

type HomeProps = {
  routes: RouteInfo[];
};

function Home(props: HomeProps) {
  return (
    <>
      <HeaderBar routes={props.routes} />
      <div>This is the homepage</div>
    </>
  );
}

export default Home;
