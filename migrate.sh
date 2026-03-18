#!/bin/bash
# Usage: 
#   ./migrate.sh local    — run on flyers_dev
#   ./migrate.sh prod     — run on flyers_db (production via Docker)

ENV=$1

if [ "$ENV" = "local" ]; then
    PSQL="psql -h 127.0.0.1 -p 5433 -U apple -d flyers_dev"
    echo "🏠 Running migrations on LOCAL (flyers_dev)"
elif [ "$ENV" = "prod" ]; then
    PSQL="ssh virusMan@192.168.1.75 docker exec -i flyers_postgres psql -U apple -d flyers_db"
    echo "🚀 Running migrations on PRODUCTION (flyers_db)"
else
    echo "Usage: ./migrate.sh local|prod"
    exit 1
fi

MIGRATIONS_DIR=~/flyers/backend/migrations

for file in $(ls $MIGRATIONS_DIR/*.sql | sort); do
    version=$(basename $file .sql)
    
    applied=$($PSQL -t -c "SELECT COUNT(*) FROM schema_migrations WHERE version='$version';" 2>/dev/null | tr -d ' ')
    
    if [ "$applied" = "1" ]; then
        echo "  ✅ $version — already applied, skipping"
    else
        echo "  ⏳ $version — applying..."
        $PSQL -f $file
        $PSQL -c "INSERT INTO schema_migrations (version) VALUES ('$version');"
        echo "  ✅ $version — done"
    fi
done

echo ""
echo "Migration complete!"
