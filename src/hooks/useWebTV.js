import { useContext } from "react";
import WebTVContext from "../context/WebTVContext";

function useWebTV() {
  return useContext(WebTVContext);
}

export default useWebTV;
