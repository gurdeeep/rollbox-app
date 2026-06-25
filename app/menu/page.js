"use client";
import { useState, useRef, useEffect } from "react";
import { menuData, accordionMenu, pizzaCategoryIds } from "../data/menu";
import MenuItem from "../components/MenuItem";

export default function MenuPage() {
  const [openSection, setOpenSection] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [vegOnly, setVegOnly] = useState(false);
  const sectionRefs = useRef({});

  const toggleSection = (sectionId) => {
    if (openSection === sectionId) {
      setOpenSection(null);
      setActiveSubTab(null);
    } else {
      setOpenSection(sectionId);
      const section = accordionMenu.find((s) => s.id === sectionId);
      if (section?.subSections) {
        setActiveSubTab(section.subSections[0].id);
      } else {
        setActiveSubTab(null);
      }
      // Scroll to section after a brief delay for DOM update
      setTimeout(() => {
        sectionRefs.current[sectionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  // Quick-nav: jump to a section from the sticky bar
  const jumpToSection = (sectionId) => {
    if (openSection !== sectionId) {
      setOpenSection(sectionId);
      const section = accordionMenu.find((s) => s.id === sectionId);
      if (section?.subSections) {
        setActiveSubTab(section.subSections[0].id);
      } else {
        setActiveSubTab(null);
      }
    }
    setTimeout(() => {
      sectionRefs.current[sectionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Scroll active nav pill into view
  const navRef = useRef(null);
  useEffect(() => {
    if (openSection && navRef.current) {
      const activeBtn = navRef.current.querySelector(".quick-nav-btn.active");
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [openSection]);

  const getCategoryData = (catId) => menuData.find((c) => c.id === catId);

  const renderSectionContent = (section) => {
    if (section.subSections) {
      const activeCat = getCategoryData(activeSubTab);
      const filtered = activeCat
        ? vegOnly ? activeCat.items.filter((i) => i.veg) : activeCat.items
        : [];

      return (
        <div className="accordion-body">
          <div className="sub-tabs">
            {section.subSections.map((sub) => (
              <button
                key={sub.id}
                className={`sub-tab ${activeSubTab === sub.id ? "active" : ""}`}
                onClick={() => setActiveSubTab(sub.id)}
              >
                {sub.name}
              </button>
            ))}
          </div>
          {activeCat && filtered.length > 0 && (
            <div className="accordion-items-area">
              <div className="sub-section-header">
                <span className="cat-icon">{activeCat.icon}</span>
                <h4>{activeCat.name}</h4>
                <span className="item-count">{filtered.length} items</span>
              </div>
              <div className="menu-grid">
                {filtered.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    categoryType={activeCat.type}
                    labels={activeCat.labels}
                    isPizza={false}
                    addonEligible={!!activeCat.addonEligible}
                  />
                ))}
              </div>
            </div>
          )}
          {filtered.length === 0 && activeCat && (
            <p className="no-items-msg">No items match the current filter.</p>
          )}
        </div>
      );
    }

    return (
      <div className="accordion-body">
        {section.categories.map((catId) => {
          const cat = getCategoryData(catId);
          if (!cat) return null;
          const filtered = vegOnly ? cat.items.filter((i) => i.veg) : cat.items;
          if (filtered.length === 0) return null;

          return (
            <div key={cat.id} className="accordion-items-area">
              {section.categories.length > 1 && (
                <div className="sub-section-header">
                  <span className="cat-icon">{cat.icon}</span>
                  <h4>{cat.name}</h4>
                  <span className="item-count">{filtered.length} items</span>
                </div>
              )}
              <div className="menu-grid">
                {filtered.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    categoryType={cat.type}
                    labels={cat.labels}
                    isPizza={pizzaCategoryIds.includes(cat.id)}
                    addonEligible={!!cat.addonEligible}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="menu-page">
      <div className="section-header" style={{ marginBottom: "0.75rem" }}>
        <h2>Our Menu</h2>
        <p>Tap a category to get started</p>
      </div>

      {/* Sticky Quick Navigation */}
      <div className="quick-nav-wrapper" ref={navRef}>
        <div className="quick-nav">
          {/* Veg filter */}
          <button
            className={`quick-nav-btn veg-filter ${vegOnly ? "active" : ""}`}
            onClick={() => setVegOnly(!vegOnly)}
          >
            <span className="veg-badge" style={{ width: 10, height: 10, borderWidth: 1 }}></span>
            {vegOnly ? "All" : "Veg"}
          </button>

          <span className="quick-nav-divider" />

          {accordionMenu.map((section) => (
            <button
              key={section.id}
              className={`quick-nav-btn ${openSection === section.id ? "active" : ""}`}
              onClick={() => jumpToSection(section.id)}
            >
              <span className="quick-nav-icon">{section.icon}</span>
              {section.name}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Menu */}
      <div className="accordion-menu">
        {accordionMenu.map((section) => {
          const isOpen = openSection === section.id;
          // Calculate total items in this section
          let sectionItemCount = 0;
          if (section.subSections) {
            section.subSections.forEach((sub) => {
              const cat = getCategoryData(sub.id);
              if (cat) sectionItemCount += cat.items.length;
            });
          } else if (section.categories) {
            section.categories.forEach((catId) => {
              const cat = getCategoryData(catId);
              if (cat) sectionItemCount += cat.items.length;
            });
          }
          return (
            <div
              key={section.id}
              ref={(el) => (sectionRefs.current[section.id] = el)}
              className={`accordion-section ${isOpen ? "open" : ""}`}
            >
              <button
                className="accordion-header"
                onClick={() => toggleSection(section.id)}
              >
                <div className="accordion-header-left">
                  <span className="accordion-icon">{section.icon}</span>
                  <span className="accordion-name">
                    {section.name}
                    <span className="accordion-item-count"> • {sectionItemCount}</span>
                  </span>
                </div>
                <span className={`accordion-chevron ${isOpen ? "rotated" : ""}`}>
                  ▾
                </span>
              </button>
              {isOpen && renderSectionContent(section)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
