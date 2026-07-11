import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './globalCSS/Table.css';
import './globalCSS/App.css';

const navItems = [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Search Flights' },
    { path: '/admin/login', label: 'Admin' }
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

    const profile_click = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn === 'true') {
            window.location.href = "/account";
        } else {
            window.location.href = "/login";
        }
    };

    const logout_click = () => {
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.removeItem('email');
        localStorage.removeItem('firstName');
        window.location.href = "/login";
    };

    const firstName = localStorage.getItem('firstName');
    const greeting = firstName ? `Hi, ${firstName}` : 'Welcome back';

    return (
        <header className="d-flex py-3 mb-4 border-bottom bg-light">
            <div className="container-fluid d-flex flex-wrap justify-content-center">
                <Link to="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
                    <svg className="bi me-2" width="40" height="32"><use xlinkHref="#bootstrap" /></svg>
                    <span className="fs-3">FlyNow</span>
                </Link>

                
                {/* unsure if we will use this section; keep for now - Josh */}
                {/* <ul className="nav">
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
                </ul> */}

                { localStorage.getItem('isLoggedIn') === 'true' && (<span className="me-2 align-self-center">{greeting}</span>) }

                <div className="dropdown">
                    <button
                        type="button"
                        className="btn btn-circle"
                        style={{
                            backgroundColor: '#ECE6F0',
                            borderColor: '#ECE6F0',
                            color: '#49454F'
                        }}
                        data-bs-toggle="dropdown"
                        aria-expanded="false">
                        <i className="bi bi-person-circle h2 m-0"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                        {localStorage.getItem('isLoggedIn') === 'true' ? (
                            <>
                                <li><button className="dropdown-item" onClick={() => window.location.href = '/account'}>
                                    <i className="bi bi-person me-2"></i>My account
                                </button></li>
                                <li><button className="dropdown-item" onClick={() => window.location.href = '/account/my-trips'}>
                                    <i className="bi bi-suitcase me-2"></i>My trips
                                </button></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item" onClick={logout_click}>
                                    <i className="bi bi-box-arrow-right me-2"></i>Log out
                                </button></li>
                            </>
                        ) : (
                            <li><button className="dropdown-item" onClick={() => window.location.href = '/login'}>
                                <i className="bi bi-box-arrow-in-right me-2"></i>Log in
                            </button></li>
                        )}
                    </ul>
                </div>
            </div>
        </header>

    );
}
export default Header;