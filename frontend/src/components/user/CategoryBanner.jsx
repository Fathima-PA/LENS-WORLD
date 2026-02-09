const CategoryBanner = ({ title, image, button }) => {
  return (
    <section className="category">
      <img src="/images/img.png.png" alt={title} />
      <div className="overlay">
        <h2>{title}</h2>
        <button>{button}</button>
      </div>
    </section>
  );
};

export default CategoryBanner;
