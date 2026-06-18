WITH admin_user AS (
    SELECT id FROM users WHERE email = 'admin@essencefit.com.br'
), inserted_coupons AS (
    INSERT INTO coupons (
        code,
        title,
        description,
        discount_type,
        discount_value,
        points_required,
        min_order_amount,
        expires_at,
        is_active
    ) VALUES
    (
        'ADMIN10',
        'Cupom da administradora 10%',
        'Cupom especial da administradora Essence Fit para usar em qualquer compra.',
        'percentage',
        10.00,
        0,
        0,
        NULL,
        TRUE
    ),
    (
        'ADMIN20',
        'Cupom da administradora 20%',
        'Cupom especial da administradora Essence Fit para usar em qualquer compra.',
        'percentage',
        20.00,
        0,
        0,
        NULL,
        TRUE
    )
    ON CONFLICT (code) DO UPDATE
    SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        discount_type = EXCLUDED.discount_type,
        discount_value = EXCLUDED.discount_value,
        points_required = EXCLUDED.points_required,
        min_order_amount = EXCLUDED.min_order_amount,
        expires_at = EXCLUDED.expires_at,
        is_active = TRUE,
        updated_at = NOW()
    RETURNING id, code
), all_admin_coupons AS (
    SELECT id FROM inserted_coupons
    UNION
    SELECT id FROM coupons WHERE code IN ('ADMIN10', 'ADMIN20')
)
INSERT INTO user_coupons (user_id, coupon_id, status, redeemed_at)
SELECT admin_user.id, all_admin_coupons.id, 'unused', NOW()
FROM admin_user
CROSS JOIN all_admin_coupons
WHERE NOT EXISTS (
    SELECT 1
    FROM user_coupons existing
    WHERE existing.user_id = admin_user.id
      AND existing.coupon_id = all_admin_coupons.id
      AND existing.status = 'unused'
);
