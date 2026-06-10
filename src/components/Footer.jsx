export default function Footer() {
  return (
    <footer style={styles.footer}>
      <p>© {new Date().getFullYear()} Ektora Softwares</p>
      <p>System developed and managed by Ektora Softwares</p>
    </footer>
  );
}

const styles = {
  footer: {
    textAlign: "center",
    padding: "15px",
    marginTop: "40px",
    borderTop: "1px solid #ddd",
    fontSize: "13px",
    color: "#666",
  },
};