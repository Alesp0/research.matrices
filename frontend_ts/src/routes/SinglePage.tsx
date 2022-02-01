import HeaderBar from "../components/HeaderBar";
import SinglePageDashboard from "../components/SinglePageDashbaord";
import { RouteInfo } from "../index";

type SinglePageProps = {
  routes: RouteInfo[];
};

function SinglePage(props: SinglePageProps) {
  return (
    <>
      <HeaderBar routes={props.routes} />
      <SinglePageDashboard />
    </>
  );
}

export default SinglePage;
