// app/page.tsx

export default function Home() {
  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        Bienvenue sur ElectriCalc ⚡
      </h1>
      <p style={{ marginTop: "1rem", fontSize: "1.2rem" }}>
        Votre assistant intelligent pour les calculs électriques.
      </p>
      <p style={{ marginTop: "2rem" }}>
        <a
          href="/dashboard"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#3b82f6",
            color: "#fff",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          Accéder au Dashboard
        </a>
      </p>
    </main>
  );
}