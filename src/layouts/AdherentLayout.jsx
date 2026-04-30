import { Outlet } from "react-router-dom";
import SidebarAdherent from "../components/layout/SidebarAdherent";
import styles from "./AdherentLayout.module.css";

export default function AdherentLayout() {
  return (
    <div className={styles.wrapper}>
      <SidebarAdherent />
      <main className={styles.contenu}>
        <Outlet />
      </main>
    </div>
  );
}
