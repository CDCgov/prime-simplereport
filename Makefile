start-backend:
	cd backend;\
	docker-compose --env-file .env.development up db &\
	SR_SCHEMASPY_PORT=8082 SR_DB_PORT=5433 gradle bootRun --args='--spring.profiles.active=dev';

start-frontend:
	cd frontend;\
	bash -l -c 'nvm use && yarn start';

start:
	make -j 2 start-backend start-frontend