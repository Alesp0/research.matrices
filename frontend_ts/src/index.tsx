import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Home from "./routes/Home";
import SinglePage from "./routes/SinglePage";

const rootElem = document.getElementById("root");

export type RouteInfo = {
  path: string;
  description: string;
};
const routes: RouteInfo[] = [
  { path: "/singlePage", description: "SinglePage" },
  { path: "/", description: "Home" },
];

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home routes={routes} />} />
        <Route path="/singlePage" element={<SinglePage routes={routes} />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  rootElem
);
