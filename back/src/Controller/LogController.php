<?php

namespace App\Controller;

use App\Entity\Log;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/logs', name: 'api_logs_')]
class LogController extends AbstractController
{
    private EntityManagerInterface $em;
    private ValidatorInterface $validator;

    public function __construct(EntityManagerInterface $em, ValidatorInterface $validator)
    {
        $this->em = $em;
        $this->validator = $validator;
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $repo = $this->em->getRepository(Log::class);
        $qb = $repo->createQueryBuilder('l');

        if ($level = $request->query->get('level')) {
            $qb->andWhere('l.level = :level')->setParameter('level', $level);
        }
        if ($userId = $request->query->get('userId')) {
            // Assuming the relationship field is 'user'
            $qb->andWhere('l.user = :uid')->setParameter('uid', (int)$userId);
        }
        if ($from = $request->query->get('from')) {
            try {
                $qb->andWhere('l.createdAt >= :from')->setParameter('from', new \DateTimeImmutable($from));
            } catch (\Exception $e) {}
        }
        if ($to = $request->query->get('to')) {
            try {
                $qb->andWhere('l.createdAt <= :to')->setParameter('to', new \DateTimeImmutable($to));
            } catch (\Exception $e) {}
        }

        $qb->orderBy('l.createdAt', 'DESC');

        $limit = max(1, (int)$request->query->get('limit', 50));
        $page = max(1, (int)$request->query->get('page', 1));

        $qb->setMaxResults($limit)->setFirstResult(($page - 1) * $limit);

        $logs = $qb->getQuery()->getResult();

        $data = array_map(function (Log $log) {
            return [
                'id' => $log->getId(),
                'level' => $log->getLevel(),
                'message' => $log->getMessage(),
                'context' => $log->getContext(),
                'userId' => $log->getUser()?->getId(),
                'username' => $log->getUser()?->getLogin(),
                'ip' => $log->getIp(),
                'createdAt' => $log->getCreatedAt()->format(\DateTime::ATOM),
            ];
        }, $logs);

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $repo = $this->em->getRepository(Log::class);
        $log = $repo->find($id);
        if (!$log) {
            return new JsonResponse(['error' => 'Log not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = [
            'id' => $log->getId(),
            'level' => $log->getLevel(),
            'message' => $log->getMessage(),
            'context' => $log->getContext(),
            'userId' => $log->getUser()?->getId(),
            'username' => $log->getUser()?->getLogin(),
            'ip' => $log->getIp(),
            'createdAt' => $log->getCreatedAt()->format(\DateTime::ATOM),
        ];

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        if (!is_array($payload)) {
            return new JsonResponse(['error' => 'Invalid JSON'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $log = new Log();
        $log->setLevel($payload['level'] ?? 'info');
        $log->setMessage($payload['message'] ?? '');
        $log->setContext($payload['context'] ?? null);
        
        // Handle User relationship
        if (isset($payload['userId'])) {
            $user = $this->em->getRepository(\App\Entity\Utilisateur::class)->find((int)$payload['userId']);
            if ($user) {
                $log->setUser($user);
            }
        }

        $log->setIp($request->getClientIp());
        $log->setCreatedAt(new \DateTimeImmutable());

        $errors = $this->validator->validate($log);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $err) {
                $messages[] = $err->getPropertyPath() . ': ' . $err->getMessage();
            }
            return new JsonResponse(['errors' => $messages], JsonResponse::HTTP_BAD_REQUEST);
        }

        $this->em->persist($log);
        $this->em->flush();

        return new JsonResponse(['id' => $log->getId()], JsonResponse::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $repo = $this->em->getRepository(Log::class);
        $log = $repo->find($id);
        if (!$log) {
            return new JsonResponse(['error' => 'Log not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->em->remove($log);
        $this->em->flush();

        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }
}
