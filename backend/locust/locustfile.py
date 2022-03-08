import time
from locust import HttpUser, task, between

class QuickstartSimpleReport(HttpUser):
    root_url = "http://backend:8080"

    @task
    def health_test(self):
        self.client.get(QuickstartSimpleReport.root_url)

    # Runs at the start of each test. Useful for authentication and setup actions.
    def on_start(self):
        pass
