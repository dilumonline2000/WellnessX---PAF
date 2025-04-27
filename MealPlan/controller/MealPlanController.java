package backend.MealPlan.controller;

import backend.MealPlan.model.MealPlanModel;
import backend.MealPlan.repository.MealPlanRepository;
import backend.exception.ResourceNotFoundException;
import backend.Notification.model.NotificationModel;
import backend.Notification.repository.NotificationRepository;
import backend.User.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@CrossOrigin("http://localhost:3000")
public class MealPlanController {
    @Autowired
    private MealPlanRepository mealPlanRepository;
    private final Path root = Paths.get("uploads/plan");
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    //Insert
    @PostMapping("/mealPlan")
    public MealPlanModel newLearningSystemModel(@RequestBody MealPlanModel newMealPlanModel) {
        System.out.println("Received data: " + newMealPlanModel); // Debugging line
        if (newMealPlanModel.getPostOwnerID() == null || newMealPlanModel.getPostOwnerID().isEmpty()) {
            throw new IllegalArgumentException("PostOwnerID is required."); // Ensure postOwnerID is provided
        }
        // Fetch user's full name from UserRepository
        String postOwnerName = userRepository.findById(newMealPlanModel.getPostOwnerID())
                .map(user -> user.getFullname())
                .orElseThrow(() -> new ResourceNotFoundException("User not found for ID: " + newMealPlanModel.getPostOwnerID()));
        newMealPlanModel.setPostOwnerName(postOwnerName);

        // Set current date and time
        String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        newMealPlanModel.setCreatedAt(currentDateTime);

        return mealPlanRepository.save(newMealPlanModel);
    }

    @PostMapping("/mealPlan/planUpload")
    public String uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String extension = file.getOriginalFilename()
                    .substring(file.getOriginalFilename().lastIndexOf("."));
            String filename = UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), this.root.resolve(filename));
            return filename;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    @GetMapping("/mealPlan")
    List<MealPlanModel> getAll() {
        List<MealPlanModel> posts = mealPlanRepository.findAll();
        posts.forEach(post -> {
            if (post.getPostOwnerID() != null) {
                String postOwnerName = userRepository.findById(post.getPostOwnerID())
                        .map(user -> user.getFullname())
                        .orElse("Unknown User");
                post.setPostOwnerName(postOwnerName);
            }
        });
        return posts;
    }

    @GetMapping("/mealPlan/{id}")
    MealPlanModel getById(@PathVariable String id) {
        MealPlanModel post = mealPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
        if (post.getPostOwnerID() != null) {
            String postOwnerName = userRepository.findById(post.getPostOwnerID())
                    .map(user -> user.getFullname())
                    .orElse("Unknown User");
            post.setPostOwnerName(postOwnerName);
        }
        return post;
    }

    @PutMapping("/mealPlan/{id}")
    MealPlanModel update(@RequestBody MealPlanModel newMealPlanModel, @PathVariable String id) {
        return mealPlanRepository.findById(id)
                .map(mealPlanModel -> {
                    mealPlanModel.setTitle(newMealPlanModel.getTitle());
                    mealPlanModel.setDescription(newMealPlanModel.getDescription());
                    mealPlanModel.setContentURL(newMealPlanModel.getContentURL());
                    mealPlanModel.setTags(newMealPlanModel.getTags());
                    mealPlanModel.setImageUrl(newMealPlanModel.getImageUrl());
                    mealPlanModel.setStartDate(newMealPlanModel.getStartDate()); // Update startDate
                    mealPlanModel.setEndDate(newMealPlanModel.getEndDate());     // Update endDate
                    mealPlanModel.setCategory(newMealPlanModel.getCategory());  // Update category
                    
                    if (newMealPlanModel.getPostOwnerID() != null && !newMealPlanModel.getPostOwnerID().isEmpty()) {
                        mealPlanModel.setPostOwnerID(newMealPlanModel.getPostOwnerID());
                        // Fetch and update the real name of the post owner
                        String postOwnerName = userRepository.findById(newMealPlanModel.getPostOwnerID())
                                .map(user -> user.getFullname())
                                .orElseThrow(() -> new ResourceNotFoundException("User not found for ID: " + newMealPlanModel.getPostOwnerID()));
                        mealPlanModel.setPostOwnerName(postOwnerName);
                    }
                    
                    mealPlanModel.setTemplateID(newMealPlanModel.getTemplateID()); // Update templateID
                    return mealPlanRepository.save(mealPlanModel);
                }).orElseThrow(() -> new ResourceNotFoundException(id));
    }

    @DeleteMapping("/mealPlan/{id}")
    public void delete(@PathVariable String id) {
        mealPlanRepository.deleteById(id);
    }

    @GetMapping("/mealPlan/planImages/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path file = root.resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Error loading image: " + e.getMessage());
        }
    }

    @Scheduled(cron = "0 0 0 * * ?") // Runs daily at midnight
    public void sendExpiryNotifications() {
        List<MealPlanModel> plans = mealPlanRepository.findAll();
        String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        plans.forEach(plan -> {
            if (plan.getEndDate() != null && plan.getPostOwnerID() != null) {
                try {
                    LocalDateTime endDate = LocalDateTime.parse(plan.getEndDate(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                    LocalDateTime threeDaysBefore = endDate.minusDays(3);

                    if (threeDaysBefore.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")).equals(currentDate)) {
                        // Check if a notification already exists for this plan and user
                        boolean notificationExists = notificationRepository.findByUserId(plan.getPostOwnerID())
                                .stream()
                                .anyMatch(notification -> notification.getMessage().contains(plan.getTitle()));

                        if (!notificationExists) {
                            NotificationModel notification = new NotificationModel();
                            notification.setUserId(plan.getPostOwnerID());
                            notification.setMessage("Your learning plan \"" + plan.getTitle() + "\" will expire soon.");
                            notification.setCreatedAt(currentDate);
                            notification.setRead(false);
                            notificationRepository.save(notification);
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error processing plan with ID: " + plan.getId() + ". Error: " + e.getMessage());
                }
            }
        });
    }
}
