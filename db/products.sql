CREATE DATABASE products;

USE products;

CREATE TABLE product_info (
  product_id INT PRIMARY KEY AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  slogan varchar(255),
  description varchar(255),
  category varchar(255) NOT NULL,
  default_price varchar(255) NOT NULL,
  UNIQUE (name)
);

CREATE TABLE products_features (
  product_id int NOT NULL,
  feature varchar(255) NOT NULL,
  value varchar(255) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES product_info(product_id)
);

CREATE TABLE products_related (
  id int PRIMARY KEY AUTO_INCREMENT,
  product_id int NOT NULL,
  related_id int NOT NULL,
  FOREIGN KEY (product_id) REFERENCES product_info(product_id),
  FOREIGN KEY (related_id) REFERENCES product_info(product_id)
);

CREATE TABLE products_styles (
  product_id int NOT NULL,
  style_id int NOT NULL,
  name varchar(255) NOT NULL,
  original_price varchar(255) NOT NULL,
  sale_price varchar(255),
  _default boolean,
  FOREIGN KEY (product_id) REFERENCES product_info(product_id),
  PRIMARY KEY (product_id, style_id)
);

CREATE TABLE styles_photos (
  id int PRIMARY KEY AUTO_INCREMENT,
  product_id int NOT NULL,
  style_id int NOT NULL,
  thumbnail_url varchar(255) NOT NULL,
  url varchar(255) NOT NULL,
  FOREIGN KEY (product_id, style_id) REFERENCES products_styles(product_id, style_id)
);

CREATE TABLE skus (
  sku_id varchar(255) PRIMARY KEY,
  product_id int NOT NULL,
  style_id int NOT NULL,
  quantity int NOT NULL,
  size varchar(255) NOT NULL,
  FOREIGN KEY (product_id, style_id) REFERENCES products_styles(product_id, style_id)
);

CREATE TABLE styles_skus (
  product_id int NOT NULL,
  sku_id varchar(255) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES product_info(product_id),
  FOREIGN KEY (sku_id) REFERENCES skus(sku_id)
);