"use client";
import { useState } from "react";
import { menuData, categoryGroups, pizzaCategoryIds } from "../data/menu";
import MenuItem from "../components/MenuItem";

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [vegOnly, setVegOnly] = useState(false);

  const scrollTo = (id) => {
    setActiveCategory(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="menu-page">
      <div className="section-header" style={{ marginBottom: "1rem" }}>
        <h2>Our Menu</h2>
        <p>Everything freshly prepared with premium ingredients</p>
      </div>

      {/* Veg filter */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
        <button
          className={`cat-btn ${vegOnly ? "active" : ""}`}
          onClick={() => setVegOnly(!vegOnly)}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <span className="veg-badge" style={{ width: 12, height: 12, borderWidth: 1 }}></span>
          {vegOnly ? "Show All" : "Veg Only"}
        </button>
      </div>

      {/* Category navigation */}
      <div className="category-nav">
        {menuData.map((cat) => (
          <button
            key={cat.id}
            className={`cat-btn ${activeCategory === cat.id ? "active" : ""}`}
            onClick={() => scrollTo(cat.id)}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Menu sections */}
      {categoryGroups.map((group) => (
        <div key={group.title}>
          <div style={{
            textAlign: "center", margin: "2.5rem 0 1.5rem",
            padding: "0.75rem", borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, rgba(232,93,38,0.1), rgba(232,93,38,0.02))",
            border: "1px solid rgba(232,93,38,0.15)",
          }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "var(--accent-light)" }}>
              {group.title}
            </h3>
          </div>

          {group.categories.map((catId) => {
            const cat = menuData.find((c) => c.id === catId);
            if (!cat) return null;
            const filtered = vegOnly ? cat.items.filter((i) => i.veg) : cat.items;
            if (filtered.length === 0) return null;
            return (
              <div key={cat.id} id={cat.id} className="menu-category">
                <div className="menu-category-header">
                  <span className="cat-icon">{cat.icon}</span>
                  <h3>{cat.name}</h3>
                  <span className="cat-desc">{cat.description}</span>
                </div>
                <div className="menu-grid">
                  {filtered.map((item) => (
                    <MenuItem
                      key={item.id}
                      item={item}
                      categoryType={cat.type}
                      labels={cat.labels}
                      isPizza={pizzaCategoryIds.includes(cat.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
