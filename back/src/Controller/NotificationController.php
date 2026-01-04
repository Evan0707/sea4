<?php

namespace App\Controller;

use App\Entity\Notification;
use App\Entity\Utilisateur;
use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/notifications')]
#[IsGranted('ROLE_USER')]
class NotificationController extends AbstractController
{
    #[Route('', name: 'api_notifications_list', methods: ['GET'])]
    public function list(NotificationRepository $notificationRepository): JsonResponse
    {
        /** @var Utilisateur $user */
        $user = $this->getUser();
        
        $notifications = $notificationRepository->findRecentByUser($user);

        return $this->json($notifications, 200, [], ['groups' => 'notification:read']);
    }

    #[Route('/unread-count', name: 'api_notifications_count', methods: ['GET'])]
    public function unreadCount(NotificationRepository $notificationRepository): JsonResponse
    {
        /** @var Utilisateur $user */
        $user = $this->getUser();
        
        $unread = $notificationRepository->findUnreadByUser($user);

        return $this->json(['count' => count($unread)]);
    }

    #[Route('/{id}/read', name: 'api_notifications_read', methods: ['PATCH'])]
    public function markAsRead(Notification $notification, EntityManagerInterface $em): JsonResponse
    {
        // Security check
        if ($notification->getUser() !== $this->getUser()) {
            return $this->json(['message' => 'Access denied'], 403);
        }

        $notification->setIsRead(true);
        $em->flush();

        return $this->json($notification, 200, [], ['groups' => 'notification:read']);
    }

    #[Route('/read-all', name: 'api_notifications_read_all', methods: ['PATCH'])]
    public function markAllAsRead(NotificationRepository $notificationRepository): JsonResponse
    {
        /** @var Utilisateur $user */
        $user = $this->getUser();
        
        $count = $notificationRepository->markAllAsRead($user);

        return $this->json(['message' => 'All marked as read', 'count' => $count]);
    }
}
