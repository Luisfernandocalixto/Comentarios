const z = require('zod');


const messages = z.object({
    msg: z.string({ message: 'message is invalid!' }).trim().min(1, { message: 'message is empty!' }),
})

function validatePartialMessage(input) {
    return messages.partial().safeParse(input)

} 

module.exports = {
  validatePartialMessage
};
