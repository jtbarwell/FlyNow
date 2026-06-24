import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './globalCSS/Table.css';
import './globalCSS/App.css';

const navItems = [
    { path: '/', label: 'Home' },
    { path: '/my-roster', label: 'My Roster' },
    {
        label: 'Batting',
        dropdown: true,
        items: [
            { path: '/batting/all-stats', label: 'All Stats' },
            { path: '/batting/leaderboard', label: 'Leaderboard' },
            {
                label: 'Teams',
                dropdown: true,
                items: [
                    {
                        label: 'AL East',
                        dropdown: true,
                        items: [    
                            { path: '/batting/teams/ALEast/TOR', label: 'Toronto Blue Jays' },
                            { path: '/batting/teams/ALEast/NYY', label: 'New York Yankees' },
                            { path: '/batting/teams/ALEast/BOS', label: 'Boston Red Sox' },
                            { path: '/batting/teams/ALEast/TBR', label: 'Tampa Bay Rays' },
                            { path: '/batting/teams/ALEast/BAL', label: 'Baltimore Orioles' },
                        ]
                    },
                    { 
                        label: 'AL West',
                        dropdown: true,
                        items: [
                            { path: '/batting/teams/ALWest/HOU', label: 'Houston Astros'},
                            { path: '/batting/teams/ALWest/SEA', label: 'Seattle Mariners'},
                            { path: '/batting/teams/ALWest/TEX', label: 'Texas Rangers'},
                            { path: '/batting/teams/ALWest/LAA', label: 'Los Angeles Angels'},
                            { path: '/batting/teams/ALWest/ATH', label: 'Athletics'},
                        ]
                    },
                    { 
                        label: 'AL Central',
                        dropdown: true,
                        items: [
                            { path: '/batting/teams/ALCentral/DET', label: 'Detroit Tigers'},
                            { path: '/batting/teams/ALCentral/CLE', label: 'Cleveland Guardians'},
                            { path: '/batting/teams/ALCentral/KCR', label: 'Kansas City Royals'},
                            { path: '/batting/teams/ALCentral/MIN', label: 'Minnesota Twins'},
                            { path: '/batting/teams/ALCentral/CHW', label: 'Chicago White Sox'},
                        ]
                    },
                    {
                        label: 'NL East',
                        dropdown: true,
                        items: [    
                            { path: '/batting/teams/NLEast/PHI', label: 'Philidelphia Phillies' },
                            { path: '/batting/teams/NLEast/NYM', label: 'New York Mets' },
                            { path: '/batting/teams/NLEast/MIA', label: 'Miami Marlins' },
                            { path: '/batting/teams/NLEast/ATL', label: 'Atlanta Braves' },
                            { path: '/batting/teams/NLEast/WSH', label: 'Washington Nationals' },
                        ]
                    },
                    { 
                        label: 'NL West',
                        dropdown: true,
                        items: [
                            { path: '/batting/teams/NLWest/LAD', label: 'Los Angeles Dodgers'},
                            { path: '/batting/teams/NLWest/SDP', label: 'San Diego Padres'},
                            { path: '/batting/teams/NLWest/SFG', label: 'San Francisco Giants'},
                            { path: '/batting/teams/NLWest/ARI', label: 'Arizona Diamondbacks'},
                            { path: '/batting/teams/NLWest/COL', label: 'Colorado Rockies'},
                        ]
                    },
                    { 
                        label: 'NL Central',
                        dropdown: true,
                        items: [
                            { path: '/batting/teams/NLCentral/DET', label: 'Detroit Tigers'},
                            { path: '/batting/teams/NLCentral/CLE', label: 'Cleveland Guardians'},
                            { path: '/batting/teams/NLCentral/KCR', label: 'Kansas City Royals'},
                            { path: '/batting/teams/NLCentral/MIN', label: 'Minnesota Twins'},
                            { path: '/batting/teams/NLCentral/CWS', label: 'Chicago White Sox'},
                        ]
                    }
                ]
            }
        ]
    },
    {
        label: 'Pitching',
        dropdown: true,
        items: [
            { path: '/pitching', label: 'All Stats' },
            { path: '/pitching/leaderboard', label: 'Leaderboard' },
            {
                label: 'Teams',
                dropdown: true,
                items: [
                    {
                        label: 'AL East',
                        dropdown: true,
                        items: [    
                            { path: '/pitching/teams/ALEast/TOR', label: 'Toronto Blue Jays' },
                            { path: '/pitching/teams/ALEast/NYY', label: 'New York Yankees' },
                            { path: '/pitching/teams/ALEast/BOS', label: 'Boston Red Sox' },
                            { path: '/pitching/teams/ALEast/TBR', label: 'Tampa Bay Rays' },
                            { path: '/pitching/teams/ALEast/BAL', label: 'Baltimore Orioles' },
                        ]
                    },
                    { 
                        label: 'AL West',
                        dropdown: true,
                        items: [
                            { path: '/pitching/teams/ALWest/HOU', label: 'Houston Astros'},
                            { path: '/pitching/teams/ALWest/SEA', label: 'Seattle Mariners'},
                            { path: '/pitching/teams/ALWest/TEX', label: 'Texas Rangers'},
                            { path: '/pitching/teams/ALWest/LAA', label: 'Los Angeles Angels'},
                            { path: '/pitching/teams/ALWest/ATH', label: 'Athletics'},
                        ]
                    },
                    { 
                        label: 'AL Central',
                        dropdown: true,
                        items: [
                            { path: '/pitching/teams/ALCentral/DET', label: 'Detroit Tigers'},
                            { path: '/pitching/teams/ALCentral/CLE', label: 'Cleveland Guardians'},
                            { path: '/pitching/teams/ALCentral/KCR', label: 'Kansas City Royals'},
                            { path: '/pitching/teams/ALCentral/MIN', label: 'Minnesota Twins'},
                            { path: '/pitching/teams/ALCentral/CWS', label: 'Chicago White Sox'},
                        ]
                    },
                    {
                        label: 'NL East',
                        dropdown: true,
                        items: [    
                            { path: '/pitching/teams/NLEast/PHI', label: 'Philidelphia Phillies' },
                            { path: '/pitching/teams/NLEast/NYM', label: 'New York Mets' },
                            { path: '/pitching/teams/NLEast/MIA', label: 'Miami Marlins' },
                            { path: '/pitching/teams/NLEast/ATL', label: 'Atlanta Braves' },
                            { path: '/pitching/teams/NLEast/WSH', label: 'Washington Nationals' },
                        ]
                    },
                    { 
                        label: 'NL West',
                        dropdown: true,
                        items: [
                            { path: '/pitching/teams/NLWest/LAD', label: 'Los Angeles Dodgers'},
                            { path: '/pitching/teams/NLWest/SDP', label: 'San Diego Padres'},
                            { path: '/pitching/teams/NLWest/SFG', label: 'San Francisco Giants'},
                            { path: '/pitching/teams/NLWest/ARI', label: 'Arizona Diamondbacks'},
                            { path: '/pitching/teams/NLWest/COL', label: 'Colorado Rockies'},
                        ]
                    },
                    { 
                        label: 'NL Central',
                        dropdown: true,
                        items: [
                            { path: '/pitching/teams/NLCentral/DET', label: 'Detroit Tigers'},
                            { path: '/pitching/teams/NLCentral/CLE', label: 'Cleveland Guardians'},
                            { path: '/pitching/teams/NLCentral/KCR', label: 'Kansas City Royals'},
                            { path: '/pitching/teams/NLCentral/MIN', label: 'Minnesota Twins'},
                            { path: '/pitching/teams/NLCentral/CWS', label: 'Chicago White Sox'},
                        ]
                    }
                ]
            }
        ]
    },
    {
        label: 'Fielding',
        dropdown: true,
        items: [
            { path: '/fielding', label: 'All Stats' },
            { path: '/fielding/leaderboard', label: 'Leaderboard' },
            {
                label: 'Teams',
                dropdown: true,
                items: [
                    {
                        label: 'AL East',
                        dropdown: true,
                        items: [    
                            { path: '/fielding/teams/ALEast/TOR', label: 'Toronto Blue Jays' },
                            { path: '/fielding/teams/ALEast/NYY', label: 'New York Yankees' },
                            { path: '/fielding/teams/ALEast/BOS', label: 'Boston Red Sox' },
                            { path: '/fielding/teams/ALEast/TBR', label: 'Tampa Bay Rays' },
                            { path: '/fielding/teams/ALEast/BAL', label: 'Baltimore Orioles' },
                        ]
                    },
                    { 
                        label: 'AL West',
                        dropdown: true,
                        items: [
                            { path: '/fielding/teams/ALWest/HOU', label: 'Houston Astros'},
                            { path: '/fielding/teams/ALWest/SEA', label: 'Seattle Mariners'},
                            { path: '/fielding/teams/ALWest/TEX', label: 'Texas Rangers'},
                            { path: '/fielding/teams/ALWest/LAA', label: 'Los Angeles Angels'},
                            { path: '/fielding/teams/ALWest/ATH', label: 'Athletics'},
                        ]
                    },
                    { 
                        label: 'AL Central',
                        dropdown: true,
                        items: [
                            { path: '/fielding/teams/ALCentral/DET', label: 'Detroit Tigers'},
                            { path: '/fielding/teams/ALCentral/CLE', label: 'Cleveland Guardians'},
                            { path: '/fielding/teams/ALCentral/KCR', label: 'Kansas City Royals'},
                            { path: '/fielding/teams/ALCentral/MIN', label: 'Minnesota Twins'},
                            { path: '/fielding/teams/ALCentral/CWS', label: 'Chicago White Sox'},
                        ]
                    },
                    {
                        label: 'NL East',
                        dropdown: true,
                        items: [    
                            { path: '/fielding/teams/NLEast/PHI', label: 'Philidelphia Phillies' },
                            { path: '/fielding/teams/NLEast/NYM', label: 'New York Mets' },
                            { path: '/fielding/teams/NLEast/MIA', label: 'Miami Marlins' },
                            { path: '/fielding/teams/NLEast/ATL', label: 'Atlanta Braves' },
                            { path: '/fielding/teams/NLEast/WSH', label: 'Washington Nationals' },
                        ]
                    },
                    { 
                        label: 'NL West',
                        dropdown: true,
                        items: [
                            { path: '/fielding/teams/NLWest/LAD', label: 'Los Angeles Dodgers'},
                            { path: '/fielding/teams/NLWest/SDP', label: 'San Diego Padres'},
                            { path: '/fielding/teams/NLWest/SFG', label: 'San Francisco Giants'},
                            { path: '/fielding/teams/NLWest/ARI', label: 'Arizona Diamondbacks'},
                            { path: '/fielding/teams/NLWest/COL', label: 'Colorado Rockies'},
                        ]
                    },
                    { 
                        label: 'NL Central',
                        dropdown: true,
                        items: [
                            { path: '/fielding/teams/NLCentral/DET', label: 'Detroit Tigers'},
                            { path: '/fielding/teams/NLCentral/CLE', label: 'Cleveland Guardians'},
                            { path: '/fielding/teams/NLCentral/KCR', label: 'Kansas City Royals'},
                            { path: '/fielding/teams/NLCentral/MIN', label: 'Minnesota Twins'},
                            { path: '/fielding/teams/NLCentral/CWS', label: 'Chicago White Sox'},
                        ]
                    }
                ]
            }
        ]
    }
];



function recurseHeader(item, parentKey = '', openSubmenus, handleSubmenuToggle) {
    return (
        <ul className="dropdown-menu">
            {item.items.map((subItem, subIndex) => {
                const key = `${parentKey}/${subItem.label}`;

                if(!subItem.dropdown) {
                    return (
                        <li key={key}>
                            <Link className="dropdown-item" to={subItem.path}>{subItem.label}</Link>
                        </li>
                    )
                } else {
                    return (
                        <li className={`dropdown-submenu ${openSubmenus[key] ? 'show' : ''}`} key={key}>
                            <a className="dropdown-item dropdown-toggle" href="#" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSubmenuToggle(key);
                                }}>{subItem.label}</a>
                            
                            {recurseHeader(subItem, key, openSubmenus, handleSubmenuToggle)}
                            
                        </li>
                    )
                }
            })}
        </ul>
    );
}






function Header() {
    const location = useLocation(); // for highlighting active nav

    const [openRootDropdown, setOpenRootDropdown] = useState(null);
    const [openSubmenus, setOpenSubmenus] = useState({});



    const handleRootDropdownToggle = (key) => {
        setOpenRootDropdown(prev => {
            if (prev === key) {
                // Closing the dropdown, also reset all submenus
                setOpenSubmenus({});
                return null;
            } else {
                // Opening a new root dropdown, reset submenus
                setOpenSubmenus({});
                return key;
            }
        });
    };

    const handleSubmenuToggle = (key) => {
        setOpenSubmenus(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };



    return (
        <header className="d-flex py-3 mb-4 border-bottom bg-light">
            <div className="container-fluid d-flex flex-wrap justify-content-center">
                <Link to="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
                    <svg className="bi me-2" width="40" height="32"><use xlinkHref="#bootstrap" /></svg>
                    <span className="fs-3">FlyNow</span>
                </Link>

                

                <ul className="nav">
                    {navItems.map((item, index) => {
                        if (!item.dropdown) {
                            return (
                                <li className="nav-item" key={index}>
                                    <Link to={item.path} className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}>{item.label}</Link>
                                </li>
                            )
                        } else {
                            return (
                                <li className="nav-item dropdown" key={index}>
                                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">{item.label}</a>
                                    
                                    {recurseHeader(item, item.label, openSubmenus, handleSubmenuToggle)}
                                    
                                </li>
                            )
                        }
                    })}
                </ul>




	            <button type="button" className="btn btn-primary btn-circle"><i className="bi bi-person-circle h2"></i></button>

            </div>
        </header>

    );
}
export default Header;