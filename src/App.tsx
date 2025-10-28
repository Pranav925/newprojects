import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Car, Home, Image, ShoppingCart, LogIn, LogOut, User, Download, Share2, Menu } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, db } from './firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';

interface Build { car: string; color: string; wheel: string; spoiler: string; interior: string; uid: string; id?: string; }

const cars: Record<string, any> = {
  sports: { name: 'Porsche 911 GT3', price: 170000, hp: 502 },
  muscle: { name: 'Dodge Hellcat', price: 72000, hp: 797 },
  supercar: { name: 'Lamborghini Aventador', price: 420000, hp: 769 },
};

const colors = [
  { name: 'Racing Red', hex: '#ff3b30' },
  { name: 'Midnight Black', hex: '#1a1a1a' },
  { name: 'Ocean Blue', hex: '#007AFF' },
  { name: 'Lime Green', hex: '#32D74B' },
  { name: 'Sunburst Yellow', hex: '#FFD60A' },
  { name: 'Pearl White', hex: '#f8f9fa' },
];

function Car3D({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[3, 1, 1.5]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.5, 0.6, 1.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {['front', 'rear'].map((pos, i) => (
        <mesh key={pos} position={[i === 0 ? 1.2 : -1.2, 0, 0.6]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
    </group>
  );
}

// ——— TOP PRO NAVBAR ———
function TopNavbar({ user, authLoading }: { user: any; authLoading: boolean }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  if (authLoading) {
    return (
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(12px)',
        zIndex: 1000, padding: '1rem 2rem', textAlign: 'center', color: '#fff'
      }}>
        Loading...
      </header>
    );
  }

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/builder', label: 'Build', icon: Car },
    { path: '/gallery', label: 'Garage', icon: Image },
    { path: '/checkout', label: 'Cart', icon: ShoppingCart },
  ];

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'rgba(10, 10, 10, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 1000,
      padding: '1rem 2rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#00d4ff', fontWeight: 800, fontSize: '1.8rem' }}>
          NexDrive
        </Link>

        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="desktop-nav">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              style={{
                color: location.pathname === path ? '#00d4ff' : '#ccc',
                fontWeight: location.pathname === path ? '600' : '500',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                background: location.pathname === path ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                transition: 'all 0.3s'
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img src={user.photoURL} alt="user" style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #00d4ff' }} />
              <span style={{ color: '#fff', fontWeight: 600 }}>{user.displayName.split(' ')[0]}</span>
              <button onClick={logout} style={{
                background: '#ff3b30', color: 'white', border: 'none', padding: '0.5rem 1rem',
                borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem'
              }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <button onClick={login} style={{
              background: '#00d4ff', color: 'white', border: 'none', padding: '0.5rem 1.5rem',
              borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600
            }}>
              <LogIn size={18} /> Sign In
            </button>
          )}
        </nav>

        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}
          className="mobile-menu-btn"
        >
          <Menu size={28} />
        </button>
      </div>

      {mobileMenu && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'rgba(15, 15, 15, 0.95)', backdropFilter: 'blur(12px)',
          padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileMenu(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '1rem', color: '#ccc', textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

// ——— HOME PAGE ———
function HomePage({ user, authLoading }: { user: any; authLoading: boolean }) {
  const navigate = useNavigate();

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  if (authLoading) return <div style={{ paddingTop: '100px', textAlign: 'center', color: '#fff' }}>Loading...</div>;

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f0f, #1a1a2e)' }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '5rem', fontWeight: 900,
          background: 'linear-gradient(135deg, #00d4ff, #ff3b30)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          NexDrive Pro
        </h1>
        <p style={{ fontSize: '1.5rem', color: '#aaa', marginBottom: '3rem' }}>
          Build & Save Your Dream Car in 3D
        </p>

        {user ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <img src={user.photoURL} alt="user" style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid #00d4ff' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.3rem' }}>{user.displayName}</div>
              <div style={{ color: '#888' }}>{user.email}</div>
            </div>
            <button onClick={logout} style={{
              background: '#ff3b30', color: 'white', border: 'none', padding: '0.75rem 1.5rem',
              borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        ) : (
          <button onClick={login} style={{
            background: '#00d4ff', color: 'white', border: 'none', padding: '1rem 2.5rem',
            borderRadius: '16px', fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 auto'
          }}>
            <LogIn size={24} /> Sign in with Google
          </button>
        )}

        <button
          onClick={() => navigate('/builder')}
          style={{
            background: 'linear-gradient(45deg, #32D74B, #00d4ff)', color: 'white', border: 'none',
            padding: '1.2rem 3rem', fontSize: '1.3rem', fontWeight: 700, borderRadius: '16px',
            marginTop: '2rem', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0, 212, 255, 0.3)'
          }}
        >
          Start Building
        </button>
      </div>
      <TopNavbar user={user} authLoading={authLoading} />
    </div>
  );
}

// ——— BUILDER PAGE ———
function BuilderPage({ user, authLoading }: { user: any; authLoading: boolean }) {
  const [build, setBuild] = useState<Build>({ car: 'sports', color: '#ff3b30', wheel: 'Classic', spoiler: 'None', interior: 'Black', uid: '' });

  if (authLoading) return <div style={{ paddingTop: '100px', textAlign: 'center', color: '#fff' }}>Loading...</div>;

  const saveBuild = async () => {
    if (!user) return alert("Please sign in first!");
    try {
      const docRef = await addDoc(collection(db, 'builds'), { ...build, uid: user.uid });
      alert("Build saved! Check your Garage.");
    } catch (e: any) {
      alert("Save failed: " + e.message);
    }
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#0a0a0a' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            borderRadius: '20px', padding: '1.5rem', overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.8rem', margin: 0 }}>{cars[build.car].name}</h2>
              <p style={{ color: '#00d4ff', fontWeight: 700 }}>${cars[build.car].price.toLocaleString()}</p>
            </div>
            <Canvas shadows style={{ height: '500px', borderRadius: '16px' }}>
              <PerspectiveCamera makeDefault position={[5, 3, 5]} />
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
              <Car3D color={build.color} />
              <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.2} />
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                <planeGeometry args={[12, 12]} />
                <shadowMaterial opacity={0.4} />
              </mesh>
            </Canvas>
          </div>

          <div style={{
            background: 'rgba(20, 20, 20, 0.8)', backdropFilter: 'blur(12px)',
            borderRadius: '20px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ color: '#00d4ff', fontSize: '1.8rem', marginBottom: '1.5rem' }}>Customize</h3>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#fff', marginBottom: '1rem' }}>Model</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                {Object.entries(cars).map(([k, c]) => (
                  <button
                    key={k}
                    onClick={() => setBuild({ ...build, car: k })}
                    style={{
                      padding: '1rem', border: build.car === k ? '3px solid #00d4ff' : '2px solid #444',
                      borderRadius: '14px', background: build.car === k ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255,255,255,0.05)',
                      color: '#fff', fontWeight: build.car === k ? '700' : '500', transition: 'all 0.3s'
                    }}
                  >
                    {c.name.split(' ')[0]}<br />
                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{c.hp} HP</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#fff', marginBottom: '1rem' }}>Paint</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setBuild({ ...build, color: c.hex })}
                    style={{
                      height: '80px', borderRadius: '14px',
                      border: build.color === c.hex ? '4px solid white' : '2px solid #555',
                      backgroundColor: c.hex, position: 'relative',
                      boxShadow: build.color === c.hex ? '0 0 20px rgba(255,255,255,0.5)' : 'none'
                    }}
                  >
                    <span style={{
                      position: 'absolute', bottom: 6, left: 0, right: 0,
                      fontSize: '0.7rem', color: '#fff', textShadow: '1px 1px 2px #000'
                    }}>
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={saveBuild}
              style={{
                width: '100%', background: 'linear-gradient(45deg, #32D74B, #00d4ff)',
                color: 'white', border: 'none', padding: '1rem', fontSize: '1.2rem',
                fontWeight: 700, borderRadius: '16px', cursor: 'pointer'
              }}
            >
              Save to Garage
            </button>
          </div>
        </div>
      </div>
      <TopNavbar user={user} authLoading={authLoading} />
    </div>
  );
}

// ——— GALLERY PAGE ———
function GalleryPage({ user, authLoading }: { user: any; authLoading: boolean }) {
  const [savedBuilds, setSavedBuilds] = useState<Build[]>([]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'builds'), where('uid', '==', user.uid));
      getDocs(q).then(snapshot => {
        setSavedBuilds(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Build)));
      });
    }
  }, [user]);

  if (authLoading) return <div style={{ paddingTop: '100px', textAlign: 'center', color: '#fff' }}>Loading...</div>;

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#0a0a0a' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{
          textAlign: 'center', fontSize: '3rem',
          background: 'linear-gradient(45deg, #ff3b30, #ffd60a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '2rem'
        }}>
          Your Garage
        </h1>

        {savedBuilds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa' }}>
            <p style={{ fontSize: '1.3rem' }}>No builds yet. Go create one!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {savedBuilds.map((b) => (
              <div key={b.id} style={{
                background: 'rgba(20, 20, 20, 0.8)', borderRadius: '20px',
                overflow: 'hidden', boxShadow: '0 15px 30px rgba(0,0,0,0.4)'
              }}>
                <div style={{ height: '200px', backgroundColor: b.color, position: 'relative' }}>
                  <div style={{
                    position: 'absolute', bottom: 16, left: 16,
                    color: '#fff', fontWeight: 700, fontSize: '1.2rem',
                    textShadow: '2px 2px 4px #000'
                  }}>
                    {cars[b.car].name}
                  </div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <p style={{ color: '#fff' }}><strong>Color:</strong> {colors.find(c => c.hex === b.color)?.name}</p>
                  <p style={{ color: '#fff' }}><strong>Price:</strong> ${cars[b.car].price.toLocaleString()}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button style={{ flex: 1, background: '#007AFF', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                      <Download size={16} /> Export
                    </button>
                    <button style={{ flex: 1, background: '#32D74B', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                      <Share2 size={16} /> Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <TopNavbar user={user} authLoading={authLoading} />
    </div>
  );
}

// ——— MAIN APP ———
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ONE GLOBAL AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage user={user} authLoading={authLoading} />} />
        <Route path="/builder" element={<BuilderPage user={user} authLoading={authLoading} />} />
        <Route path="/gallery" element={<GalleryPage user={user} authLoading={authLoading} />} />
        <Route path="/checkout" element={
          <div style={{ paddingTop: '100px', textAlign: 'center', minHeight: '100vh', color: '#fff' }}>
            <h1 style={{ fontSize: '3rem' }}>Checkout Coming Soon</h1>
            <TopNavbar user={user} authLoading={authLoading} />
          </div>
        } />
      </Routes>
    </>
  );
}
