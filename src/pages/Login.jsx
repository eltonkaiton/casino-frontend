import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/employees/login",
        formData
      );

      // SAVE TOKEN
      localStorage.setItem("token", res.data.token);

      // SAVE EMPLOYEE INFO
      localStorage.setItem(
        "employee",
        JSON.stringify(res.data.employee)
      );

      alert("Login successful");

      // REDIRECT
      window.location.href = "/";

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1429 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background elements */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0) 70%)",
        borderRadius: "50%",
        animation: "pulse 4s ease-in-out infinite",
      }} />
      
      <div style={{
        position: "absolute",
        bottom: "10%",
        right: "5%",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(255,215,0,0.08) 0%, rgba(255,215,0,0) 70%)",
        borderRadius: "50%",
        animation: "pulse 5s ease-in-out infinite reverse",
      }} />

      <div
        className="card shadow-lg"
        style={{
          width: "450px",
          borderRadius: "20px",
          background: "rgba(20, 25, 50, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 215, 0, 0.3)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(255,215,0,0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Decorative chip pattern */}
        <div style={{
          position: "absolute",
          top: "-15px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60px",
          height: "60px",
          background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 15px rgba(255,215,0,0.3)",
          border: "2px solid rgba(255,255,255,0.5)",
        }}>
          <span style={{ fontSize: "28px" }}>🎲</span>
        </div>

        <div className="card-body p-5 pt-4">
          <div className="text-center mb-4">
            <h2 style={{
              color: "#ffd700",
              fontWeight: "700",
              letterSpacing: "2px",
              textShadow: "0 2px 10px rgba(255,215,0,0.3)",
              marginBottom: "8px",
            }}>
              CASINO NIGHT
            </h2>
            <p style={{
              color: "#a0a4c0",
              fontSize: "14px",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}>
              Admin Access
            </p>
            <div style={{
              width: "50px",
              height: "2px",
              background: "linear-gradient(90deg, transparent, #ffd700, transparent)",
              margin: "15px auto 0",
            }} />
          </div>

          <form onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div className="mb-4">
              <label className="form-label" style={{
                color: "#c0c4e0",
                fontSize: "13px",
                fontWeight: "600",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}>
                EMAIL ADDRESS
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#ffd700",
                  fontSize: "18px",
                }}>✉️</span>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="admin@casinonight.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,215,0,0.2)",
                    color: "#fff",
                    padding: "12px 12px 12px 45px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#ffd700"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,215,0,0.2)"}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="mb-4">
              <label className="form-label" style={{
                color: "#c0c4e0",
                fontSize: "13px",
                fontWeight: "600",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}>
                PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#ffd700",
                  fontSize: "18px",
                }}>🔒</span>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,215,0,0.2)",
                    color: "#fff",
                    padding: "12px 12px 12px 45px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#ffd700"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,215,0,0.2)"}
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="btn w-100"
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                color: "#0a0e27",
                fontWeight: "700",
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                letterSpacing: "2px",
                fontSize: "15px",
                transition: "all 0.3s ease",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 15px rgba(255,215,0,0.2)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(255,215,0,0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(255,215,0,0.2)";
                }
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" style={{ width: "0.8rem", height: "0.8rem" }} />
                  AUTHENTICATING...
                </>
              ) : (
                "ACCESS CASINO NIGHT"
              )}
            </button>

            {/* decorative elements */}
            <div className="text-center mt-4">
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "15px",
                opacity: 0.5,
              }}>
                <span style={{ fontSize: "20px" }}>♠️</span>
                <span style={{ fontSize: "20px" }}>♥️</span>
                <span style={{ fontSize: "20px" }}>♣️</span>
                <span style={{ fontSize: "20px" }}>♦️</span>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: "center",
        padding: "15px",
        background: "rgba(10, 14, 39, 0.8)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(255, 215, 0, 0.2)",
        zIndex: 2,
      }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}>
          <span style={{
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "12px",
            letterSpacing: "1px",
          }}>
            Developed & Maintained by
          </span>
          <span style={{
            color: "#ffd700",
            fontWeight: "700",
            fontSize: "13px",
            letterSpacing: "1px",
            textShadow: "0 0 10px rgba(255, 215, 0, 0.5)",
          }}>
            EKTORA SOFTWARES
          </span>
          <span style={{
            color: "rgba(255, 255, 255, 0.4)",
            fontSize: "10px",
          }}>
            © {new Date().getFullYear()}
          </span>
        </div>
        <div style={{
          fontSize: "10px",
          color: "rgba(255, 255, 255, 0.3)",
          marginTop: "5px",
          letterSpacing: "0.5px",
        }}>
          Enterprise Casino Management System
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes reverse {
          0%, 100% { transform: scale(1.1); opacity: 0.5; }
          50% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

export default Login;