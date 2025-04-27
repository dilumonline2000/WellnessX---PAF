package backend.MealPlan.repository;


import backend.MealPlan.model.MealPlanModel;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MealPlanRepository extends MongoRepository<MealPlanModel, String> {
    void deleteByPostOwnerID(String postOwnerID);
    List<MealPlanModel> findByPostOwnerID(String postOwnerID);
    List<MealPlanModel> findByPostOwnerName(String postOwnerName); // New method
}
