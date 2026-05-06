import React, { useContext, useState } from 'react';
import Card from '../components/Card';
import { AppContext } from '../context/AppContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const Settings = () => {
  const { theme, setTheme } = useContext(AppContext);
  const [compact, setCompact] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="container-fluid p-0 page-fade" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <h1 className="h2 mb-4">Settings</h1>
      
      {success && <div className="alert alert-success mb-3">Settings saved!</div>}

      <div className="row g-3">
        <div className="col-12">
          <Card
            title="Interface Theme"
            subtitle="Switch between Nebula Cosmic Dark mode and Solar Amber Light mode."
          >
            <div className="d-flex gap-3 mt-3">
              <button
                type="button"
                className={`btn p-4 flex-grow-1 border d-flex flex-column align-items-center justify-content-center gap-2 rounded-3 transition-all ${
                  theme === 'nebula' 
                    ? 'border-primary bg-primary bg-opacity-10 text-white' 
                    : 'border-secondary border-opacity-25 bg-dark bg-opacity-25 text-secondary'
                }`}
                style={{
                  boxShadow: theme === 'nebula' ? '0 0 15px rgba(139, 92, 246, 0.25)' : 'none'
                }}
                onClick={() => setTheme('nebula')}
              >
                <FaMoon size="24" className={theme === 'nebula' ? 'text-primary' : ''} />
                <span className="fw-semibold">Nebula Mode</span>
                <span className="small text-muted" style={{ fontSize: '0.75rem' }}>Cosmic Dark</span>
              </button>

              <button
                type="button"
                className={`btn p-4 flex-grow-1 border d-flex flex-column align-items-center justify-content-center gap-2 rounded-3 transition-all ${
                  theme === 'solar' 
                    ? 'border-primary bg-primary bg-opacity-10 text-white' 
                    : 'border-secondary border-opacity-25 bg-dark bg-opacity-25 text-secondary'
                }`}
                style={{
                  boxShadow: theme === 'solar' ? '0 0 15px rgba(249, 115, 22, 0.25)' : 'none'
                }}
                onClick={() => setTheme('solar')}
              >
                <FaSun size="24" className={theme === 'solar' ? 'text-primary' : ''} />
                <span className="fw-semibold">Solar Mode</span>
                <span className="small text-muted" style={{ fontSize: '0.75rem' }}>Amber Light</span>
              </button>
            </div>
          </Card>
        </div>

        <div className="col-12 mt-3">
          <Card
            title="Workspace preferences"
            subtitle="Display density for tables. All data stays in this browser (localStorage)."
          >
            <form onSubmit={handleSubmit}>
              <div className="form-check form-switch mb-4">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="set_compact" 
                  checked={compact} 
                  onChange={e => setCompact(e.target.checked)} 
                />
                <label className="form-check-label ms-2" htmlFor="set_compact">
                  Compact tables (visual density)
                </label>
                <div className="form-text text-secondary mt-1">Reduce padding in lists to show more data at once.</div>
              </div>
              
              <button type="submit" className="btn btn-primary px-4">
                Save settings
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
