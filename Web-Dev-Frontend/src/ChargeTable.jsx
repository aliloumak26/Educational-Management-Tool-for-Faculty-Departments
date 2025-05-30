import React, { useState, useEffect } from 'react';
import './ChargeTable.css';

const ChargeTable = ({ user }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('S1'); // Nouvel état pour le filtre semestre

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = 'http://localhost:5000/api/teacher-charge';
        if (user) {
          const teacherName = `${user.lastName}, ${user.firstName}`;
          url += `?teacher=${encodeURIComponent(teacherName)}&semester=${selectedSemester}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Erreur inconnue');
        
        setModules(data.modules);
      } catch (err) {
        console.error('Erreur lors de la récupération des charges:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, selectedSemester]); // Recharger quand user change

const calculateTotal = (moduleItem) => {
  return Number(moduleItem.totalHours) || 0;
};
 useEffect(() => {
    document.body.style.overflow = "hidden"; // désactiver le scroll
    return () => {
      document.body.style.overflow = "auto"; // réactiver après départ
    };
  }, []);

const globalTotal = modules.reduce((sum, moduleItem) => {
  return sum + calculateTotal(moduleItem);
}, 0);

  const toggleDropdown = (index) => {
    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const getDropdownPosition = (index) => {
    const isFirstHalf = index < modules.length / 2;
    return {
      top: isFirstHalf ? '100%' : 'auto',
      bottom: isFirstHalf ? 'auto' : '100%',
      left: '0',
      right: 'auto',
      maxHeight: '200px',
      overflowY: 'auto'
    };
  };

  if (loading) {
    return <div className="charge-table-container">Chargement en cours...</div>;
  }

  if (error) {
    return <div className="charge-table-container">Erreur: {error}</div>;
  }

  return (
        <div className="charge-table-container">
      <div className="charge-table-header-controls">
        
        
        {user && (
          <div className="charge-semester-filter">
            <div className="charge-filter-label">Semestre:</div>
            <div className="charge-filter-options">
              <button
                className={`charge-filter-button ${selectedSemester === 'S1' ? 'active' : ''}`}
                onClick={() => setSelectedSemester('S1')}
              >
                S1
              </button>
              <button
                className={`charge-filter-button ${selectedSemester === 'S2' ? 'active' : ''}`}
                onClick={() => setSelectedSemester('S2')}
              >
                S2
              </button>
            </div>
          </div>
        )}
      </div>
      <table className="charge-table">
        <thead>
  <tr>
    <th className="charge-table-header">Module</th>
    <th className="charge-table-header">Année</th>
    <th className="charge-table-header">Type</th>
    <th className="charge-table-header">Spécialité</th>
    <th className="charge-table-header">Section</th>
    <th className="charge-table-header">En charge de</th>
    <th className="charge-table-header">Total (h)</th>
  </tr>
</thead>
       <tbody>
  {modules.map((item, index) => {
    const total = calculateTotal(item);
    
    return (
      <tr key={index} className="charge-table-row">
        <td className="charge-table-cell">{item.module}</td>
        <td className="charge-table-cell">{item.year}</td>
        <td className="charge-table-cell">{item.type}</td>
        <td className="charge-table-cell">{item.spec}</td>
        <td className="charge-table-cell">{item.section}</td>
        <td className="charge-table-cell charge-table-cell-dropdown">
          <button 
            className="charge-table-dropdown-button" 
            onClick={() => toggleDropdown(index)}
          >
            {item.charges?.length > 0 ? `${item.charges.length} sélectionnés` : 'Aucune charge'}
          </button>
          
          {dropdownOpen === index && (
            <div 
              className="charge-table-dropdown-content"
              style={getDropdownPosition(index)}
            >
              {item.charges?.length > 0 ? (
                item.charges.map((charge, i) => (
                  <div key={i} className="charge-table-selected-item">
                    <span>✓ {charge}</span>
                  </div>
                ))
              ) : (
                <div className="charge-table-no-items">Aucune charge assignée</div>
              )}
            </div>
          )}
        </td>
        <td className="charge-table-cell charge-table-total-cell">
  {(item.totalHours || 0) > 12 ? (
    <span className="charge-table-warning">
      {Number(item.totalHours || 0).toFixed(1)}h (max 12h!)
    </span>
  ) : (
    `${Number(item.totalHours || 0).toFixed(1)}h`
  )}
</td>
      </tr>
    );
  })}
</tbody>
      </table>
      {user && (
        <div className="charge-table-total">
  Charge horaire totale :
  <span className={globalTotal > 12 ? 'charge-table-global-warning' : 'charge-table-global-ok'}>
    {globalTotal.toFixed(1)}h
  </span>
</div>
      )}
    </div>
  );
};

export default ChargeTable;