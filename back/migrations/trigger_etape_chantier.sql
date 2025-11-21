-- Trigger pour créer automatiquement les etape_chantier lors de la création d'un chantier
-- Ce trigger insère toutes les étapes du modèle sélectionné dans la table etape_chantier

-- Fonction qui sera appelée par le trigger
CREATE OR REPLACE FUNCTION bati.auto_create_etape_chantier()
RETURNS TRIGGER AS $$
BEGIN
    -- Si un modèle est associé au chantier
    IF NEW."noModele" IS NOT NULL THEN
        -- Insérer toutes les étapes du modèle dans etape_chantier
        INSERT INTO bati."etape_chantier" ("noEtape", "noChantier", "montantTheoriqueFacture", "reservee", "dateDebutTheorique", "dateDebut", "dateFin")
        SELECT 
            c."noEtape",
            NEW."noChantier",
            c."montantFacture",
            FALSE,  -- Les étapes ne sont pas réservées par défaut
            CASE 
                WHEN c."noEtape" = 1 THEN NEW."dateCreation"  -- L'étape 1 commence à la date de création du chantier
                ELSE NULL
            END,
            NULL,
            NULL
        FROM bati."construire" c
        WHERE c."noModele" = NEW."noModele";
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger qui s'exécute après l'insertion d'un chantier
DROP TRIGGER IF EXISTS trigger_auto_create_etape_chantier ON bati."chantier";

CREATE TRIGGER trigger_auto_create_etape_chantier
    AFTER INSERT ON bati."chantier"
    FOR EACH ROW
    EXECUTE FUNCTION bati.auto_create_etape_chantier();
