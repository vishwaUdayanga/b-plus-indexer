import { HealthCheckRequest } from "./health-check-api-with-dbs.type";
import { SingleBooleanResponse } from "@/types/request-response/response";

export async function healthCheckWithDBs({healthCheckRequest}: {healthCheckRequest: HealthCheckRequest}): Promise<SingleBooleanResponse> {

    try {
        // Health check the API base URL. 
        const api_response = await fetch(`${healthCheckRequest.url}/health_check_api`, {
            method: "GET",
        });

        if (!api_response.ok) {
            return { success: false, message: `Health check for API failed with status code ${api_response.status}` };
        }
    } catch (error) {
        return { success: false, message: `Health check for API failed with error: ${error}` };
    }
    try {

        // Health check the Organization DB.
        const org_response = await fetch(`${healthCheckRequest.url}/health_check_organization_db`, {
            method: "GET",
        });
        
        if (!org_response.ok) {
            return { success: false, message: `Health check for Organization DB failed with status code ${org_response.status}` };
        }
    } catch (error) {
        return { success: false, message: `Health check for Organization DB failed with error: ${error}` };
    }
    try {

        // Health check the Indexer DB.
        const indexer_response = await fetch(`${healthCheckRequest.url}/health_check_b_plus_db`, {
            method: "GET",
        });

        if (!indexer_response.ok) {
            return { success: false, message: `Health check for Indexer DB failed with status code ${indexer_response.status}` };
        }
    }
    catch (error) {
        return { success: false, message: `Health check for Indexer DB failed with error: ${error}` };
    }

    return { success: true, message: "All health checks passed successfully." };
}