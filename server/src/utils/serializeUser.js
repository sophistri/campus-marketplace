// using this as a schema for what a logged in user looks like

export function toPublicUser(user){
    return {
        id: user._id,
        email: user.email,
        name: user.name,
        campus: user.campus,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
    };
}