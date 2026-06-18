INSERT INTO users (
    name,
    email,
    password_hash,
    role,
    points,
    check_in_unlocked,
    confirmed_orders
) VALUES (
    'Administradora Essence Fit',
    'admin@essencefit.com.br',
    '$2a$10$SFlYkE/mkzvVg1HoR7UKweIhZANqfcwZUkkmFOJ0.cUKBI0bOj4lm',
    'ADMIN',
    0,
    TRUE,
    0
) ON CONFLICT (email) DO UPDATE
SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = 'ADMIN',
    check_in_unlocked = TRUE,
    updated_at = NOW();

INSERT INTO products (
    name,
    slug,
    description,
    category,
    season,
    fabric,
    color,
    size_label,
    price,
    stock,
    image_url,
    is_active
) VALUES
(
    'Conjunto Termico Azul Inverno',
    'conjunto-termico-azul-inverno',
    'Conjunto fitness de inverno com jaqueta, top e legging em tons frios. Inspirado na coleção Inverno do PDF Essence Fit.',
    'fitness-feminino',
    'inverno',
    'tecido termico',
    'Azul profundo',
    'P/M/G',
    199.00,
    18,
    '/brand/pdf-assets/asset-028.png',
    TRUE
),
(
    'Casaco Desportivo Coral',
    'casaco-desportivo-coral',
    'Casaco desportivo com fechamento frontal, conforto para treinos em dias frios e visual vibrante.',
    'fitness-feminino',
    'inverno',
    'malha termica',
    'Coral',
    'P/M/G',
    119.90,
    15,
    '/brand/pdf-assets/asset-031.png',
    TRUE
),
(
    'Top Alta Cobertura Preto',
    'top-alta-cobertura-preto',
    'Top de alta cobertura com sustentacao para treino, zero transparencia e acabamento premium.',
    'fitness-feminino',
    'inverno',
    'poliamida premium',
    'Preto',
    'P/M/G',
    89.00,
    24,
    '/brand/pdf-assets/asset-004.png',
    TRUE
),
(
    'Legging Termica Black',
    'legging-termica-black',
    'Legging de cintura alta para treino, com toque firme, modelagem bonita e conforto extremo.',
    'fitness-feminino',
    'inverno',
    'suplex termico',
    'Preto',
    'P/M/G',
    129.00,
    22,
    '/brand/pdf-assets/asset-045.png',
    TRUE
)
ON CONFLICT (slug) DO UPDATE
SET
    description = EXCLUDED.description,
    season = EXCLUDED.season,
    fabric = EXCLUDED.fabric,
    color = EXCLUDED.color,
    size_label = EXCLUDED.size_label,
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    image_url = EXCLUDED.image_url,
    is_active = TRUE,
    updated_at = NOW();
