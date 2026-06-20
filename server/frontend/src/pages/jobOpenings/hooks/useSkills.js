import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSkills, createSkill, deleteSkill } from '../../../services/skillService';

export const useSkills = () => {
    return useQuery({
        queryKey: ['skills'],
        queryFn: getSkills,
    });
};

export const useCreateSkill = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createSkill,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['skills'] });
        },
    });
};

export const useDeleteSkill = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteSkill,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['skills'] });
        },
    });
};