import Hero from "../components/UI/Hero";

function HomePage() {
  return (
    <>
      <Hero />
      <div className="container" style={{ padding: "3rem 1.5rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            marginBottom: "0.5rem",
          }}>
          À propos de la plateforme
        </h2>
        <p style={{ color: "var(--couleur-texte-clair)", lineHeight: "1.8" }}>
          Fennec Arts rassemble artistes, amateurs et curieux autour d'une même
          passion : la culture algérienne sous toutes ses formes.
        </p>
      </div>
    </>
  );
}

export default HomePage;
