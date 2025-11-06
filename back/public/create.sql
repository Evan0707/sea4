CREATE TABLE "client" (
    "noClient" SERIAL PRIMARY KEY,
    "nomClient" VARCHAR(50) NOT NULL,
    "prenomClient" VARCHAR(50) NOT NULL,
    "adresseClient" VARCHAR(100),
    "cpClient" CHAR(5) CHECK ("cpClient" ~ '^[0-9]{5}$'),
    "villeClient" VARCHAR(50)
);

CREATE TABLE "utilisateur" (
    "noUtilisateur" SERIAL PRIMARY KEY,
    "login" VARCHAR(50) UNIQUE NOT NULL,
    "motDePasse" VARCHAR(255) NOT null,
    "nomRole" VARCHAR(50) UNIQUE
        CHECK ("nomRole" IN ('admin', 'commercial', 'maitre_oeuvre'))
);

CREATE TABLE "modele" (
    "noModele" SERIAL PRIMARY KEY,
    "nomModele" VARCHAR(50) NOT NULL,
    "descriptionModele" TEXT
);

CREATE TABLE "etape" (
    "noEtape" SERIAL PRIMARY KEY,
    "nomEtape" VARCHAR(50) NOT NULL,
    "reservable" BOOLEAN DEFAULT FALSE
);

CREATE TABLE "maitre_oeuvre" (
    "noMOE" SERIAL PRIMARY KEY,
    "nomMOE" VARCHAR(50) NOT NULL,
    "prenomMOE" VARCHAR(50) NOT null,
    "noUtilisateur" INT not null references "utilisateur"("noUtilisateur") on delete cascade
);

CREATE TABLE "artisan" (
    "noArtisan" SERIAL PRIMARY KEY,
    "nomArtisan" VARCHAR(50) NOT NULL,
    "prenomArtisan" VARCHAR(50),
    "adresseArtisan" VARCHAR(100),
    "cpArtisan" CHAR(5) CHECK ("cpArtisan" ~ '^[0-9]{5}$'),
    "villeArtisan" VARCHAR(50)
);

CREATE TABLE chantier (
    "noChantier" SERIAL PRIMARY KEY,
    "adresseChantier" VARCHAR(100),
    "cpChantier" CHAR(5) CHECK ("cpChantier" ~ '^[0-9]{5}$'),
    "villeChantier" VARCHAR(50),
    "dateCreation" DATE DEFAULT CURRENT_DATE,
    "noClient" INT NOT NULL REFERENCES "client"("noClient") ON DELETE CASCADE,
    "noMOE" INT REFERENCES "maitre_oeuvre"("noMOE"),
    "noModele" INT REFERENCES "modele"("noModele")
);

CREATE TABLE "construire" (
    "noModele" INT REFERENCES "modele"("noModele") ON DELETE CASCADE,
    "noEtape" INT REFERENCES "etape"("noEtape") ON DELETE CASCADE,
    "montantFacture" NUMERIC(10,2),
    "coutSousTraitant" NUMERIC(10,2),
    "nbJoursRealisation" INT,
    PRIMARY KEY ("noModele", "noEtape")
);

CREATE TABLE "etape_chantier" (
    "noEtapeChantier" SERIAL PRIMARY KEY,
    "noChantier" INT REFERENCES "chantier"("noChantier") ON DELETE CASCADE,
    "noEtape" INT REFERENCES "etape"("noEtape"),
    "montantTheoriqueFacture" NUMERIC(10,2),
    "reservee" BOOLEAN DEFAULT FALSE,
    "reducSuppl" NUMERIC(5,2) CHECK ("reducSuppl" BETWEEN -30 AND 30),
    "descriptionReducSuppl" VARCHAR(100),
    "dateDebutTheorique" DATE,
    "dateDebut" DATE,
    "dateFin" DATE CHECK ("dateFin" IS NULL OR "dateFin" >= "dateDebut")
);

CREATE TABLE "etre_qualifie_pour" (
    "noArtisan" INT REFERENCES "artisan"("noArtisan") ON DELETE CASCADE,
    "noEtape" INT REFERENCES "etape"("noEtape") ON DELETE CASCADE,
    PRIMARY KEY ("noArtisan", "noEtape")
);

CREATE TABLE "confier" (
    "noArtisan" INT REFERENCES "artisan"("noArtisan") ON DELETE SET NULL,
    "noEtapeChantier" INT UNIQUE REFERENCES "etape_chantier"("noEtapeChantier") ON DELETE CASCADE,
    PRIMARY KEY ("noArtisan", "noEtapeChantier")
);

CREATE TABLE "appel" (
    "noAppel" SERIAL PRIMARY KEY,
    "noChantier" INT REFERENCES "chantier"("noChantier") ON DELETE CASCADE,
    "dateAppel" DATE DEFAULT CURRENT_DATE,
    "montantAppel" NUMERIC(10,2) CHECK ("montantAppel" >= 0),
    "dateReglAppel" DATE
);

CREATE TABLE "facture_artisan" (
    "noFacture" SERIAL PRIMARY KEY,
    "noArtisan" INT REFERENCES "artisan"("noArtisan") ON DELETE CASCADE,
    "dateFacture" DATE DEFAULT CURRENT_DATE,
    "montantFacture" NUMERIC(10,2) CHECK ("montantFacture" >= 0),
    "nbJoursTravail" INT,
    "dateReglFacture" DATE
);

CREATE TABLE "associer" (
    "noEtapeChantier" INT REFERENCES "etape_chantier"("noEtapeChantier") ON DELETE CASCADE,
    "noFacture" INT REFERENCES "facture_artisan"("noFacture") ON DELETE CASCADE,
    PRIMARY KEY ("noEtapeChantier", "noFacture")
);

ALTER TABLE "chantier"
ADD COLUMN "statutChantier" VARCHAR(20)
    DEFAULT 'À compléter'
    CHECK ("statutChantier" IN ('À compléter', 'À venir', 'En chantier', 'Terminé'));

ALTER TABLE "etape_chantier"
ADD COLUMN "statutEtape" VARCHAR(20)
    DEFAULT 'À venir'
    CHECK ("statutEtape" IN ('À venir', 'En cours', 'Terminé'));
