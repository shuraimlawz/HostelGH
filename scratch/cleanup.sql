-- Cleanup script for HostelGH
DELETE FROM "ReviewPhoto";
DELETE FROM "OwnerResponse";
DELETE FROM "Review";
DELETE FROM "Favorite";
DELETE FROM "BookingItem";
DELETE FROM "Payment";
DELETE FROM "Booking";
DELETE FROM "HostelFacility";
DELETE FROM "Room";
DELETE FROM "Hostel";
DELETE FROM "Subscription";
DELETE FROM "AdminAuditLog";
DELETE FROM "RefreshToken";
DELETE FROM "PasswordResetToken";
DELETE FROM "EmailVerificationToken";
DELETE FROM "Message";
DELETE FROM "Conversation";
DELETE FROM "Wallet";
DELETE FROM "NewsletterSubscriber";

-- Delete all users except admin
DELETE FROM "User" WHERE email != 'admin@example.com';
