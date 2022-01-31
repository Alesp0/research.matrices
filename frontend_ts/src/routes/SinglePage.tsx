import HeaderBar from "../components/HeaderBar";
import { RouteInfo } from "../index";

type SinglePageProps = {
  routes: RouteInfo[];
};

function SinglePage(props: SinglePageProps) {
  return (
    <>
      <HeaderBar routes={props.routes} />
      <div>Hello World</div>
    </>
  );
}

export default SinglePage;
