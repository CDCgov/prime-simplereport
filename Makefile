start-backend:
	cd backend;\
	SR_SCHEMASPY_PORT=8082 docker-compose up --build;

start-frontend:
	cd frontend;\
	bash -l -c 'nvm use' && yarn start;

start:
	make -j 2 start-backend start-frontend