<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251127063238 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // Migration modified to only update foreign key constraints in schema `batiparti`
        // This avoids destructive auto-generated DROP/CREATE across unrelated schemas.

        // Update chantier.noClient -> add ON DELETE CASCADE
        $this->addSql("DO $$\nDECLARE cname text;\nBEGIN\n  SELECT tc.constraint_name INTO cname\n  FROM information_schema.table_constraints tc\n  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema AND tc.table_name = kcu.table_name\n  WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'batiparti' AND tc.table_name = 'chantier' AND kcu.column_name = 'noClient'\n  LIMIT 1;\n  IF cname IS NOT NULL THEN\n    EXECUTE format('ALTER TABLE batiparti.chantier DROP CONSTRAINT %I', cname);\n  END IF;\nEND$$;");
        $this->addSql("ALTER TABLE batiparti.chantier ADD CONSTRAINT fk_chantier_noclient FOREIGN KEY (noClient) REFERENCES batiparti.client(noClient) ON DELETE CASCADE");

        // Update etape_chantier.noChantier -> add ON DELETE CASCADE
        $this->addSql("DO $$\nDECLARE cname text;\nBEGIN\n  SELECT tc.constraint_name INTO cname\n  FROM information_schema.table_constraints tc\n  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema AND tc.table_name = kcu.table_name\n  WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'batiparti' AND tc.table_name = 'etape_chantier' AND kcu.column_name = 'noChantier'\n  LIMIT 1;\n  IF cname IS NOT NULL THEN\n    EXECUTE format('ALTER TABLE batiparti.etape_chantier DROP CONSTRAINT %I', cname);\n  END IF;\nEND$$;");
        $this->addSql("ALTER TABLE batiparti.etape_chantier ADD CONSTRAINT fk_etapechantier_nochantier FOREIGN KEY (noChantier) REFERENCES batiparti.chantier(noChantier) ON DELETE CASCADE");

        // Update confier join table constraints -> add ON DELETE CASCADE
        $this->addSql("DO $$\nDECLARE cname text;\nBEGIN\n  SELECT tc.constraint_name INTO cname\n  FROM information_schema.table_constraints tc\n  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema AND tc.table_name = kcu.table_name\n  WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'batiparti' AND tc.table_name = 'confier' AND kcu.column_name = 'noEtapeChantier'\n  LIMIT 1;\n  IF cname IS NOT NULL THEN\n    EXECUTE format('ALTER TABLE batiparti.confier DROP CONSTRAINT %I', cname);\n  END IF;\nEND$$;");
        $this->addSql("DO $$\nDECLARE cname text;\nBEGIN\n  SELECT tc.constraint_name INTO cname\n  FROM information_schema.table_constraints tc\n  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema AND tc.table_name = kcu.table_name\n  WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'batiparti' AND tc.table_name = 'confier' AND kcu.column_name = 'noArtisan'\n  LIMIT 1;\n  IF cname IS NOT NULL THEN\n    EXECUTE format('ALTER TABLE batiparti.confier DROP CONSTRAINT %I', cname);\n  END IF;\nEND$$;");
        $this->addSql("ALTER TABLE batiparti.confier ADD CONSTRAINT fk_confier_noetapechantier FOREIGN KEY (noEtapeChantier) REFERENCES batiparti.etape_chantier(noEtapeChantier) ON DELETE CASCADE");
        $this->addSql("ALTER TABLE batiparti.confier ADD CONSTRAINT fk_confier_noartisan FOREIGN KEY (noArtisan) REFERENCES batiparti.artisan(noArtisan) ON DELETE CASCADE");

        // Update associer join table constraints -> add ON DELETE CASCADE
        $this->addSql("DO $$\nDECLARE cname text;\nBEGIN\n  SELECT tc.constraint_name INTO cname\n  FROM information_schema.table_constraints tc\n  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema AND tc.table_name = kcu.table_name\n  WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'batiparti' AND tc.table_name = 'associer' AND kcu.column_name = 'noEtapeChantier'\n  LIMIT 1;\n  IF cname IS NOT NULL THEN\n    EXECUTE format('ALTER TABLE batiparti.associer DROP CONSTRAINT %I', cname);\n  END IF;\nEND$$;");
        $this->addSql("DO $$\nDECLARE cname text;\nBEGIN\n  SELECT tc.constraint_name INTO cname\n  FROM information_schema.table_constraints tc\n  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema AND tc.table_name = kcu.table_name\n  WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'batiparti' AND tc.table_name = 'associer' AND kcu.column_name = 'noFacture'\n  LIMIT 1;\n  IF cname IS NOT NULL THEN\n    EXECUTE format('ALTER TABLE batiparti.associer DROP CONSTRAINT %I', cname);\n  END IF;\nEND$$;");
        $this->addSql("ALTER TABLE batiparti.associer ADD CONSTRAINT fk_associer_noetapechantier FOREIGN KEY (noEtapeChantier) REFERENCES batiparti.etape_chantier(noEtapeChantier) ON DELETE CASCADE");
        $this->addSql("ALTER TABLE batiparti.associer ADD CONSTRAINT fk_associer_nofacture FOREIGN KEY (noFacture) REFERENCES batiparti.facture_artisan(noFacture) ON DELETE CASCADE");

        // Update appel.noChantier constraint to CASCADE if present
        $this->addSql("DO $$\nDECLARE cname text;\nBEGIN\n  SELECT tc.constraint_name INTO cname\n  FROM information_schema.table_constraints tc\n  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema AND tc.table_name = kcu.table_name\n  WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'batiparti' AND tc.table_name = 'appel' AND kcu.column_name = 'noChantier'\n  LIMIT 1;\n  IF cname IS NOT NULL THEN\n    EXECUTE format('ALTER TABLE batiparti.appel DROP CONSTRAINT %I', cname);\n  END IF;\nEND$$;");
        $this->addSql("ALTER TABLE batiparti.appel ADD CONSTRAINT fk_appel_nochantier FOREIGN KEY (noChantier) REFERENCES batiparti.chantier(noChantier) ON DELETE CASCADE");
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA Transport');
        $this->addSql('CREATE SCHEMA TP5');
        $this->addSql('CREATE SCHEMA baseinterim');
        $this->addSql('CREATE SCHEMA TP1-Programmation-serveur');
        $this->addSql('CREATE SCHEMA TP2-trigger');
        $this->addSql('CREATE SCHEMA mvtstock');
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('CREATE SCHEMA TRTest');
        $this->addSql('CREATE SCHEMA tp_optimisation');
        $this->addSql('CREATE SEQUENCE bati.utilisateur_noUtilisateur_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE bati.artisan_noArtisan_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE bati.modele_noModele_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE bati.facture_artisan_noFacture_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE bati.appel_noAppel_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE bati.chantier_noChantier_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE bati.maitre_oeuvre_noMOE_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE bati.client_noClient_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE bati.etape_chantier_noEtapeChantier_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE bati.etape_noEtape_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE "TP5"."chercheur" (n_chercheur VARCHAR(5) NOT NULL, nom_chercheur VARCHAR(20) DEFAULT NULL, code_spec VARCHAR(5) NOT NULL, universite SMALLINT DEFAULT NULL, n_equipe VARCHAR(5) NOT NULL, PRIMARY KEY (n_chercheur))');
        $this->addSql('CREATE TABLE "TP5"."equipe" (n_equipe VARCHAR(5) NOT NULL, nom_equipe VARCHAR(25) DEFAULT NULL, PRIMARY KEY (n_equipe))');
        $this->addSql('CREATE TABLE "TP5"."projet" (n_projet VARCHAR(5) NOT NULL, nom_projet VARCHAR(20) DEFAULT NULL, n_cher_resp VARCHAR(5) DEFAULT NULL, PRIMARY KEY (n_projet))');
        $this->addSql('CREATE TABLE "TP5"."specialite" (code_spec VARCHAR(5) NOT NULL, nom_specialite VARCHAR(30) DEFAULT NULL, tarif SMALLINT DEFAULT NULL, PRIMARY KEY (code_spec))');
        $this->addSql('CREATE TABLE "TP5"."travailler" (n_projet VARCHAR(5) NOT NULL, n_chercheur VARCHAR(5) NOT NULL, nb_jour_sem SMALLINT DEFAULT NULL, PRIMARY KEY (n_projet, n_chercheur))');
        $this->addSql('CREATE TABLE "TRTest"."acheter" (fournum SMALLINT NOT NULL, artnum SMALLINT NOT NULL, prixachat NUMERIC(19, 4) DEFAULT NULL, delai SMALLINT DEFAULT NULL, encommande SMALLINT DEFAULT NULL, PRIMARY KEY (fournum, artnum))');
        $this->addSql('CREATE TABLE "TRTest"."articles" (artnum SMALLINT NOT NULL, libelle VARCHAR(15) DEFAULT NULL, stock SMALLINT DEFAULT NULL, PRIMARY KEY (artnum))');
        $this->addSql('CREATE TABLE "TRTest"."fourniss" (fournum SMALLINT NOT NULL, fournom VARCHAR(15) DEFAULT NULL, fouradr VARCHAR(30) DEFAULT NULL, fourvil VARCHAR(20) DEFAULT NULL, PRIMARY KEY (fournum))');
        $this->addSql('CREATE TABLE "Transport"."camion" (immat VARCHAR(8) NOT NULL, dateachat DATE DEFAULT NULL, typecamion VARCHAR(2) DEFAULT NULL, PRIMARY KEY (immat))');
        $this->addSql('CREATE TABLE "Transport"."chantier" (nochantier VARCHAR(16) NOT NULL, adressechantier VARCHAR(40) DEFAULT NULL, cpchantier CHAR(5) DEFAULT NULL, villechantier VARCHAR(30) DEFAULT NULL, datedebut DATE DEFAULT NULL, nomconducteurtravaux VARCHAR(30) DEFAULT NULL, PRIMARY KEY (nochantier))');
        $this->addSql('CREATE TABLE "Transport"."chargement" (nochantier VARCHAR(16) NOT NULL, notransport INT NOT NULL, poids INT DEFAULT NULL, volume INT DEFAULT NULL, PRIMARY KEY (nochantier, notransport))');
        $this->addSql('CREATE TABLE "Transport"."chauffeur" (nochauffeur INT NOT NULL, nomchauffeur VARCHAR(30) DEFAULT NULL, prenomchauffeur VARCHAR(20) DEFAULT NULL, adressechauffeur VARCHAR(40) DEFAULT NULL, cp CHAR(5) DEFAULT NULL, ville VARCHAR(360) DEFAULT NULL, typepermis VARCHAR(2) DEFAULT NULL, PRIMARY KEY (nochauffeur))');
        $this->addSql('CREATE TABLE "Transport"."transport" (notransport INT NOT NULL, datetransport DATE DEFAULT NULL, heuredepart TIME(0) WITHOUT TIME ZONE DEFAULT NULL, heurearrivee TIME(0) WITHOUT TIME ZONE DEFAULT NULL, immat VARCHAR(8) DEFAULT NULL, nochauffeur INT DEFAULT NULL, PRIMARY KEY (notransport))');
        $this->addSql('CREATE TABLE "Transport"."typcamion" (typecamion VARCHAR(2) NOT NULL, libelletype VARCHAR(20) DEFAULT NULL, typepermis VARCHAR(2) DEFAULT NULL, poidstotalmaxencharge INT DEFAULT NULL, poidsavide INT DEFAULT NULL, volumeutile INT DEFAULT NULL, PRIMARY KEY (typecamion))');
        $this->addSql('CREATE TABLE baseinterim.agence (num_agence SMALLINT NOT NULL, nom_agence VARCHAR(32) DEFAULT NULL, adresse_agence VARCHAR(44) DEFAULT NULL, PRIMARY KEY (num_agence))');
        $this->addSql('CREATE TABLE baseinterim.client (num_client SMALLINT NOT NULL, nom_client VARCHAR(32) NOT NULL, adr_client VARCHAR(44) DEFAULT NULL, cond_paiement SMALLINT NOT NULL, PRIMARY KEY (num_client))');
        $this->addSql('CREATE TABLE baseinterim.effectuer (num_mission SMALLINT NOT NULL, num_mois SMALLINT NOT NULL, nb_heures SMALLINT DEFAULT NULL, PRIMARY KEY (num_mission, num_mois))');
        $this->addSql('CREATE TABLE baseinterim.facture (num_facture SMALLINT NOT NULL, num_client SMALLINT NOT NULL, date_facture DATE NOT NULL, date_reglement DATE DEFAULT NULL, num_mois SMALLINT DEFAULT NULL, PRIMARY KEY (num_facture))');
        $this->addSql('CREATE UNIQUE INDEX facture_verif_unicite_client_mois ON baseinterim.facture (num_client, num_mois)');
        $this->addSql('CREATE TABLE baseinterim.interimaire (num_interim SMALLINT NOT NULL, num_agence SMALLINT NOT NULL, num_insee VARCHAR(15) DEFAULT NULL, nom_interim VARCHAR(32) DEFAULT NULL, adresse_interim VARCHAR(44) DEFAULT NULL, PRIMARY KEY (num_interim))');
        $this->addSql('CREATE TABLE baseinterim.mission (num_mission SMALLINT NOT NULL, num_interim SMALLINT NOT NULL, num_client SMALLINT NOT NULL, date_debut DATE DEFAULT NULL, date_fin DATE DEFAULT NULL, qualification VARCHAR(32) DEFAULT NULL, taux_horaire_interim NUMERIC(19, 4) DEFAULT NULL, taux_horaire_client NUMERIC(19, 4) DEFAULT NULL, PRIMARY KEY (num_mission))');
        $this->addSql('CREATE TABLE baseinterim.mois (num_mois SMALLINT NOT NULL, PRIMARY KEY (num_mois))');
        $this->addSql('CREATE TABLE baseinterim.verser (num_mission SMALLINT NOT NULL, dte DATE NOT NULL, acompte_verse DOUBLE PRECISION DEFAULT NULL, PRIMARY KEY (num_mission, dte))');
        $this->addSql('CREATE TABLE appel ("noAppel" INT DEFAULT nextval(\'"appel_noAppel_seq"\'::regclass) NOT NULL, "noChantier" INT DEFAULT NULL, "dateAppel" DATE DEFAULT CURRENT_DATE, "montantAppel" NUMERIC(10, 2) DEFAULT NULL, "dateReglAppel" DATE DEFAULT NULL, PRIMARY KEY ("noAppel"))');
        $this->addSql('CREATE INDEX IDX_130D3BD9AB661A1 ON appel ("noChantier")');
        $this->addSql('CREATE TABLE artisan ("noArtisan" INT DEFAULT nextval(\'"artisan_noArtisan_seq"\'::regclass) NOT NULL, "nomArtisan" VARCHAR(50) NOT NULL, "prenomArtisan" VARCHAR(50) DEFAULT NULL, "adresseArtisan" VARCHAR(100) DEFAULT NULL, "cpArtisan" CHAR(5) DEFAULT NULL, "villeArtisan" VARCHAR(50) DEFAULT NULL, PRIMARY KEY ("noArtisan"))');
        $this->addSql('CREATE TABLE associer ("noEtapeChantier" INT NOT NULL, "noFacture" INT NOT NULL, PRIMARY KEY ("noEtapeChantier", "noFacture"))');
        $this->addSql('CREATE INDEX IDX_FA230DB97FFC781A ON associer ("noFacture")');
        $this->addSql('CREATE INDEX IDX_FA230DB9CE6E9C96 ON associer ("noEtapeChantier")');
        $this->addSql('CREATE TABLE chantier ("noChantier" INT DEFAULT nextval(\'"chantier_noChantier_seq"\'::regclass) NOT NULL, "adresseChantier" VARCHAR(100) DEFAULT NULL, "cpChantier" CHAR(5) DEFAULT NULL, "villeChantier" VARCHAR(50) DEFAULT NULL, "dateCreation" DATE DEFAULT CURRENT_DATE, "noClient" INT NOT NULL, "noMOE" INT DEFAULT NULL, "noModele" INT DEFAULT NULL, "statutChantier" VARCHAR(20) DEFAULT \'À compléter\', PRIMARY KEY ("noChantier"))');
        $this->addSql('CREATE INDEX IDX_636F27F6A604C9C4 ON chantier ("noMOE")');
        $this->addSql('CREATE INDEX IDX_636F27F67B3DFA4E ON chantier ("noClient")');
        $this->addSql('CREATE INDEX IDX_636F27F655BC072 ON chantier ("noModele")');
        $this->addSql('CREATE TABLE client ("noClient" INT DEFAULT nextval(\'"client_noClient_seq"\'::regclass) NOT NULL, "nomClient" VARCHAR(50) NOT NULL, "prenomClient" VARCHAR(50) NOT NULL, "adresseClient" VARCHAR(100) DEFAULT NULL, "cpClient" CHAR(5) DEFAULT NULL, "villeClient" VARCHAR(50) DEFAULT NULL, PRIMARY KEY ("noClient"))');
        $this->addSql('CREATE TABLE commercial ("noCommercial" INT GENERATED BY DEFAULT AS IDENTITY NOT NULL, "nomCommercial" VARCHAR(50) NOT NULL, "prenomCommercial" VARCHAR(50) NOT NULL, "noutilisateur" INT NOT NULL, PRIMARY KEY ("noCommercial"))');
        $this->addSql('CREATE UNIQUE INDEX uniq_a23ce648afa61481 ON commercial ("noutilisateur")');
        $this->addSql('CREATE TABLE confier ("noArtisan" INT NOT NULL, "noEtapeChantier" INT NOT NULL, PRIMARY KEY ("noArtisan", "noEtapeChantier"))');
        $this->addSql('CREATE UNIQUE INDEX "confier_noEtapeChantier_key" ON confier ("noEtapeChantier")');
        $this->addSql('CREATE INDEX IDX_7582A277D530D7E ON confier ("noArtisan")');
        $this->addSql('CREATE TABLE construire (montantfacture NUMERIC(10, 2) DEFAULT NULL, coutsoustraitant NUMERIC(10, 2) DEFAULT NULL, nbjoursrealisation INT DEFAULT NULL, nomodele INT NOT NULL, noetape INT NOT NULL, PRIMARY KEY (nomodele, noetape))');
        $this->addSql('CREATE INDEX idx_be9926737bd17021 ON construire (nomodele)');
        $this->addSql('CREATE INDEX idx_be99267390fbf88d ON construire (noetape)');
        $this->addSql('CREATE TABLE etape ("noEtape" INT DEFAULT nextval(\'"etape_noEtape_seq"\'::regclass) NOT NULL, "nomEtape" VARCHAR(50) NOT NULL, reservable BOOLEAN DEFAULT false, PRIMARY KEY ("noEtape"))');
        $this->addSql('CREATE TABLE etape_chantier ("noEtapeChantier" INT DEFAULT nextval(\'"etape_chantier_noEtapeChantier_seq"\'::regclass) NOT NULL, "noChantier" INT DEFAULT NULL, "noEtape" INT DEFAULT NULL, "montantTheoriqueFacture" NUMERIC(10, 2) DEFAULT NULL, reservee BOOLEAN DEFAULT false, "reducSuppl" NUMERIC(5, 2) DEFAULT NULL, "descriptionReducSuppl" VARCHAR(100) DEFAULT NULL, "dateDebutTheorique" DATE DEFAULT NULL, "dateDebut" DATE DEFAULT NULL, "dateFin" DATE DEFAULT NULL, "statutEtape" VARCHAR(20) DEFAULT \'À venir\', PRIMARY KEY ("noEtapeChantier"))');
        $this->addSql('CREATE INDEX IDX_72354509BBD7CBEE ON etape_chantier ("noEtape")');
        $this->addSql('CREATE INDEX IDX_723545099AB661A1 ON etape_chantier ("noChantier")');
        $this->addSql('CREATE TABLE etre_qualifie_pour ("noArtisan" INT NOT NULL, "noEtape" INT NOT NULL, PRIMARY KEY ("noArtisan", "noEtape"))');
        $this->addSql('CREATE INDEX IDX_749B83F87D530D7E ON etre_qualifie_pour ("noArtisan")');
        $this->addSql('CREATE INDEX IDX_749B83F8BBD7CBEE ON etre_qualifie_pour ("noEtape")');
        $this->addSql('CREATE TABLE facture_artisan ("noFacture" INT DEFAULT nextval(\'"facture_artisan_noFacture_seq"\'::regclass) NOT NULL, "noArtisan" INT DEFAULT NULL, "dateFacture" DATE DEFAULT CURRENT_DATE, "montantFacture" NUMERIC(10, 2) DEFAULT NULL, "nbJoursTravail" INT DEFAULT NULL, "dateReglFacture" DATE DEFAULT NULL, PRIMARY KEY ("noFacture"))');
        $this->addSql('CREATE INDEX IDX_7487AB8A7D530D7E ON facture_artisan ("noArtisan")');
        $this->addSql('CREATE TABLE maitre_oeuvre ("noMOE" INT DEFAULT nextval(\'"maitre_oeuvre_noMOE_seq"\'::regclass) NOT NULL, "nomMOE" VARCHAR(50) NOT NULL, "prenomMOE" VARCHAR(50) NOT NULL, "noutilisateur" INT NOT NULL, PRIMARY KEY ("noMOE"))');
        $this->addSql('CREATE INDEX IDX_36980215AFA61481 ON maitre_oeuvre ("noutilisateur")');
        $this->addSql('CREATE TABLE modele ("noModele" INT DEFAULT nextval(\'"modele_noModele_seq"\'::regclass) NOT NULL, "nomModele" VARCHAR(50) NOT NULL, "descriptionModele" TEXT DEFAULT NULL, PRIMARY KEY ("noModele"))');
        $this->addSql('CREATE TABLE utilisateur ("noutilisateur" INT DEFAULT nextval(\'"utilisateur_noUtilisateur_seq"\'::regclass) NOT NULL, login VARCHAR(50) NOT NULL, "motDePasse" VARCHAR(255) NOT NULL, "nomRole" VARCHAR(50) DEFAULT NULL, PRIMARY KEY ("noutilisateur"))');
        $this->addSql('CREATE UNIQUE INDEX utilisateur_login_key ON utilisateur (login)');
        $this->addSql('CREATE TABLE mvtstock.mvt (idmvt INT NOT NULL, datemvt DATE NOT NULL, qtemvt INT NOT NULL, reference CHAR(5) NOT NULL, PRIMARY KEY (idmvt))');
        $this->addSql('CREATE TABLE mvtstock.produit (reference CHAR(5) NOT NULL, libelle VARCHAR(30) NOT NULL, qtestock INT NOT NULL, PRIMARY KEY (reference))');
        $this->addSql('CREATE TABLE public."user" (id INT NOT NULL, username VARCHAR(100) NOT NULL, email VARCHAR(180) NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE tp_optimisation.customer (customerid INT NOT NULL, salespersonid INT DEFAULT NULL, territoryid INT DEFAULT NULL, accountnumber INT DEFAULT NULL, customertype VARCHAR(1) DEFAULT NULL, modifieddate TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY (customerid))');
        $this->addSql('CREATE TABLE tp_optimisation.product (productid INT NOT NULL, name VARCHAR(50) DEFAULT NULL, productnumber VARCHAR(25) DEFAULT NULL, discontinueddate TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, makeflag BOOLEAN DEFAULT NULL, standardcost NUMERIC(19, 4) DEFAULT NULL, finishedgoodsflag BOOLEAN DEFAULT NULL, color VARCHAR(15) DEFAULT NULL, safetystocklevel SMALLINT DEFAULT NULL, reorderpoint SMALLINT DEFAULT NULL, listprice NUMERIC(19, 4) DEFAULT NULL, size VARCHAR(50) DEFAULT NULL, sizeunitmeasurecode VARCHAR(3) DEFAULT NULL, productphotoid INT DEFAULT NULL, weightunitmeasurecode VARCHAR(3) DEFAULT NULL, weight DOUBLE PRECISION DEFAULT NULL, daystomanufacture INT DEFAULT NULL, productline VARCHAR(2) DEFAULT NULL, dealerprice NUMERIC(19, 4) DEFAULT NULL, class VARCHAR(2) DEFAULT NULL, style VARCHAR(2) DEFAULT NULL, productsubcategoryid INT DEFAULT NULL, productmodelid INT DEFAULT NULL, modifieddate TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, sellstartdate TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, sellenddate TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY (productid))');
        $this->addSql('CREATE TABLE tp_optimisation.productcategory (productcategoryid INT NOT NULL, name VARCHAR(50) DEFAULT NULL, modifieddate TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY (productcategoryid))');
        $this->addSql('CREATE TABLE tp_optimisation.productsubcategory (productsubcategoryid INT NOT NULL, productcategoryid INT DEFAULT NULL, name VARCHAR(50) DEFAULT NULL, modifieddate TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY (productsubcategoryid))');
        $this->addSql('CREATE TABLE tp_optimisation.salesorderdetail (salesorderid INT NOT NULL, linenumber SMALLINT NOT NULL, productid INT DEFAULT NULL, specialofferid INT DEFAULT NULL, carriertrackingnumber VARCHAR(25) DEFAULT NULL, orderqty SMALLINT DEFAULT NULL, unitprice NUMERIC(19, 4) DEFAULT NULL, unitpricediscount DOUBLE PRECISION DEFAULT NULL, modifieddate TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, linetotal DOUBLE PRECISION DEFAULT NULL, PRIMARY KEY (salesorderid, linenumber))');
        $this->addSql('CREATE TABLE tp_optimisation.salesorderheader (salesorderid INT NOT NULL, customerid INT DEFAULT NULL, salespersonid INT DEFAULT NULL, territoryid INT DEFAULT NULL, purchaseordernumber VARCHAR(25) DEFAULT NULL, currencycode VARCHAR(3) DEFAULT NULL, subtotal NUMERIC(19, 4) DEFAULT NULL, taxamt NUMERIC(19, 4) DEFAULT NULL, freight NUMERIC(19, 4) DEFAULT NULL, orderdate TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, revisionnumber SMALLINT DEFAULT NULL, status SMALLINT DEFAULT NULL, billtoaddressid INT DEFAULT NULL, shiptoaddressid INT DEFAULT NULL, shipdate TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, shipmethodid INT DEFAULT NULL, creditcardid INT DEFAULT NULL, creditcardnumber VARCHAR(20) DEFAULT NULL, creditcardexpmonth SMALLINT DEFAULT NULL, creditcardexpyear SMALLINT DEFAULT NULL, contactid INT DEFAULT NULL, onlineorderflag BOOLEAN DEFAULT NULL, comment VARCHAR(128) DEFAULT NULL, modifieddate TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, duedate TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, salesordernumber VARCHAR(25) DEFAULT NULL, totaldue NUMERIC(19, 4) DEFAULT NULL, PRIMARY KEY (salesorderid))');
        $this->addSql('CREATE TABLE tp_optimisation.salesperson (salespersonid INT NOT NULL, territoryid INT DEFAULT NULL, salesquota NUMERIC(19, 4) DEFAULT NULL, bonus NUMERIC(19, 4) DEFAULT NULL, commissionpct DOUBLE PRECISION DEFAULT NULL, salesytd NUMERIC(19, 4) DEFAULT NULL, saleslastyear NUMERIC(19, 4) DEFAULT NULL, modifieddate TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY (salespersonid))');
        $this->addSql('ALTER TABLE appel ADD CONSTRAINT "appel_noChantier_fkey" FOREIGN KEY ("noChantier") REFERENCES chantier ("noChantier") ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE associer ADD CONSTRAINT "associer_noFacture_fkey" FOREIGN KEY ("noFacture") REFERENCES facture_artisan ("noFacture") ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE associer ADD CONSTRAINT "associer_noEtapeChantier_fkey" FOREIGN KEY ("noEtapeChantier") REFERENCES etape_chantier ("noEtapeChantier") ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE chantier ADD CONSTRAINT "chantier_noMOE_fkey" FOREIGN KEY ("noMOE") REFERENCES maitre_oeuvre ("noMOE") NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE chantier ADD CONSTRAINT "chantier_noClient_fkey" FOREIGN KEY ("noClient") REFERENCES client ("noClient") ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE chantier ADD CONSTRAINT "chantier_noModele_fkey" FOREIGN KEY ("noModele") REFERENCES modele ("noModele") NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE commercial ADD CONSTRAINT fk_a23ce648afa61481 FOREIGN KEY ("noutilisateur") REFERENCES utilisateur ("noutilisateur") NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE confier ADD CONSTRAINT "confier_noArtisan_fkey" FOREIGN KEY ("noArtisan") REFERENCES artisan ("noArtisan") ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE confier ADD CONSTRAINT "confier_noEtapeChantier_fkey" FOREIGN KEY ("noEtapeChantier") REFERENCES etape_chantier ("noEtapeChantier") ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE etape_chantier ADD CONSTRAINT "etape_chantier_noEtape_fkey" FOREIGN KEY ("noEtape") REFERENCES etape ("noEtape") NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE etape_chantier ADD CONSTRAINT "etape_chantier_noChantier_fkey" FOREIGN KEY ("noChantier") REFERENCES chantier ("noChantier") ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE etre_qualifie_pour ADD CONSTRAINT "etre_qualifie_pour_noArtisan_fkey" FOREIGN KEY ("noArtisan") REFERENCES artisan ("noArtisan") ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE etre_qualifie_pour ADD CONSTRAINT "etre_qualifie_pour_noEtape_fkey" FOREIGN KEY ("noEtape") REFERENCES etape ("noEtape") ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE facture_artisan ADD CONSTRAINT "facture_artisan_noArtisan_fkey" FOREIGN KEY ("noArtisan") REFERENCES artisan ("noArtisan") ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE maitre_oeuvre ADD CONSTRAINT "maitre_oeuvre_noUtilisateur_fkey" FOREIGN KEY ("noutilisateur") REFERENCES utilisateur ("noutilisateur") ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE batiparti.associer DROP CONSTRAINT FK_91C771ED7347E7D');
        $this->addSql('ALTER TABLE batiparti.associer DROP CONSTRAINT FK_91C771EABE56FDF');
        $this->addSql('ALTER TABLE batiparti.associer ADD CONSTRAINT fk_91c771ed7347e7d FOREIGN KEY (nofacture) REFERENCES batiparti.facture_artisan (nofacture) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE batiparti.associer ADD CONSTRAINT fk_91c771eabe56fdf FOREIGN KEY (noetapechantier) REFERENCES batiparti.etape_chantier (noetapechantier) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE batiparti.chantier DROP CONSTRAINT FK_90505D51AC97F12C');
        $this->addSql('ALTER TABLE batiparti.chantier ADD CONSTRAINT fk_90505d51ac97f12c FOREIGN KEY (noclient) REFERENCES batiparti.client (noclient) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE batiparti.confier DROP CONSTRAINT FK_8153C535ABE56FDF');
        $this->addSql('ALTER TABLE batiparti.confier DROP CONSTRAINT FK_8153C53515D210BE');
        $this->addSql('ALTER TABLE batiparti.confier ADD CONSTRAINT fk_8153c535abe56fdf FOREIGN KEY (noetapechantier) REFERENCES batiparti.etape_chantier (noetapechantier) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE batiparti.confier ADD CONSTRAINT fk_8153c53515d210be FOREIGN KEY (noartisan) REFERENCES batiparti.artisan (noartisan) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE batiparti.etape_chantier DROP CONSTRAINT FK_DA84B94F50458809');
        $this->addSql('ALTER TABLE batiparti.etape_chantier ADD CONSTRAINT fk_da84b94f50458809 FOREIGN KEY (nochantier) REFERENCES batiparti.chantier (nochantier) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE batiparti.utilisateur ALTER noutilisateur SET DEFAULT nextval(\'batiparti.utilisateur_noutilisateur_seq\'::regclass)');
        $this->addSql('ALTER TABLE batiparti.utilisateur ALTER noutilisateur DROP IDENTITY');
        $this->addSql('ALTER INDEX batiparti.uniq_a29d94e4aa08cb10 RENAME TO utilisateur_login_key');
    }
}
