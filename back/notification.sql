-- Script de création de la table notifications
-- Compatible PostgreSQL (utilisation de JSONB et Schema)

-- 1. Création de la table
CREATE TABLE IF NOT EXISTS batiparti.notification (
    id BIGSERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,        -- 'INFO', 'SUCCESS', 'WARNING', 'ERROR', 'SYSTEM'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,   -- Données additionnelles (liens, ID objet lié, meta-data)
    is_read BOOLEAN DEFAULT FALSE,    -- Statut de lecture simple
    read_at TIMESTAMP NULL,           -- Date précise de lecture (optionnel mais utile)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,        -- Pour suppression automatique des vieilles notifs
    
    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES batiparti.utilisateur (noUtilisateur)
        ON DELETE CASCADE
);

-- 2. Index pour les performances
-- Pour récupérer rapidement les notifs non-lues d'un utilisateur
CREATE INDEX idx_notif_user_unread ON batiparti.notification(user_id) WHERE is_read = FALSE;

-- Pour lister l'historique récent d'un utilisateur
CREATE INDEX idx_notif_user_date ON batiparti.notification(user_id, created_at DESC);

-- Pour le nettoyage automatique (cron job)
CREATE INDEX idx_notif_expires ON batiparti.notification(expires_at);

-- 3. Commentaires (Documentation intégrée)
COMMENT ON TABLE batiparti.notification IS 'Système de notifications utilisateur';
COMMENT ON COLUMN batiparti.notification.data IS 'Payload JSON pour flexibilité future (ex: { "action_url": "/chantier/12", "icon": "tool" })';
