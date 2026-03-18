#!/bin/bash
ENV=$1
SERVER="virusMan@192.168.1.75"
MIGRATIONS_DIR=~/flyers/backend/migrations

if [ "$ENV" = "local" ]; then
    PSQL="psql -h 127.0.0.1 -p 5433 -U apple -d flyers_dev"
    echo "🏠 Running migrations on LOCAL (flyers_dev)"

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

elif [ "$ENV" = "prod" ]; then
    echo "🚀 Running migrations on PRODUCTION (flyers_db)"

    # Copy all migration files to server at once
    echo "  📦 Copying migration files to server..."
    scp $MIGRATIONS_DIR/*.sql $SERVER:/tmp/

    # Run a single script on the server
    ssh $SERVER << 'REMOTE'
for file in $(ls /tmp/0*.sql | sort); do
    version=$(basename $file .sql)
    applied=$(docker exec flyers_postgres psql -U apple -d flyers_db -t -c "SELECT COUNT(*) FROM schema_migrations WHERE version='$version';" 2>/dev/null | tr -d ' \r\n')
    if [ "$applied" = "1" ]; then
        echo "  ✅ $version — already applied, skipping"
    else
        echo "  ⏳ $version — applying..."
        docker exec -i flyers_postgres psql -U apple -d flyers_db < $file
        docker exec flyers_postgres psql -U apple -d flyers_db -c "INSERT INTO schema_migrations (version) VALUES ('$version') ON CONFLICT DO NOTHING;"
        echo "  ✅ $version — done"
    fi
    rm $file
done
REMOTE

else
    echo "Usage: ./migrate.sh local|prod"
    exit 1
fi

echo ""
echo "Migration complete!"
