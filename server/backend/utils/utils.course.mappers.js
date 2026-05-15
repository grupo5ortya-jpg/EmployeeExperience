const formatEmployeeCoursesResponse = (employee) => {
    return {
        employee: {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            position: employee.position,
            status: employee.status,
        },
        courses: employee.courseEnrollments.map((enrollment) => ({
            id: enrollment.course.id,
            title: enrollment.course.title,
            description: enrollment.course.description,
            modality: enrollment.course.modality,
            provider: enrollment.course.provider,
            durationHours: enrollment.course.durationHours,
            enrollment: {
                id: enrollment.id,
                status: enrollment.status,
                progressPercent: enrollment.progressPercent,
                enrolledAt: enrollment.enrolledAt,
                completedAt: enrollment.completedAt,
            },
        })),
    };
};

const formatCourseEmployeesResponse = (course) => {
    return {
        course: {
            id: course.id,
            title: course.title,
            description: course.description,
            modality: course.modality,
            provider: course.provider,
            durationHours: course.durationHours,
            isActive: course.isActive,
        },
        employees: course.courseEnrollments.map((enrollment) => ({
            id: enrollment.employee.id,
            firstName: enrollment.employee.firstName,
            lastName: enrollment.employee.lastName,
            position: enrollment.employee.position,
            status: enrollment.employee.status,
            enrollment: {
                id: enrollment.id,
                status: enrollment.status,
                progressPercent: enrollment.progressPercent,
                enrolledAt: enrollment.enrolledAt,
                completedAt: enrollment.completedAt,
            },
        })),
    };
};

module.exports = {
    formatEmployeeCoursesResponse,
    formatCourseEmployeesResponse,
};