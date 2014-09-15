import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.QueueingConsumer;
import com.rabbitmq.client.MessageProperties;

public class worker {

    private static final String JOB_QUEUE_NAME = "jobs_queue";
    private static final String RESULT_QUEUE_NAME = "result_queue";

    public static void main(String[] argv) throws Exception {

        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("192.168.1.111");
        Connection rabbitMQConnection = factory.newConnection();
        Channel channelJobs = rabbitMQConnection.createChannel();
        channelJobs.queueDeclare(JOB_QUEUE_NAME, true, false, false, null);



        System.out.println(" [*] Waiting for messages. To exit press CTRL+C");

        channelJobs.basicQos(1);

        QueueingConsumer consumer = new QueueingConsumer(channelJobs);
        channelJobs.basicConsume(JOB_QUEUE_NAME, false, consumer);



        while (true) {
            QueueingConsumer.Delivery delivery = consumer.nextDelivery();
            String message = new String(delivery.getBody());

            System.out.println(" [x] Received '" + message + "'");
            channelJobs.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
            Thread.sleep(1000);


            Channel channelResult = rabbitMQConnection.createChannel();
            channelResult.queueDeclare(RESULT_QUEUE_NAME, true, false, false, null);

            channelResult.basicPublish( "", RESULT_QUEUE_NAME,
                    MessageProperties.TEXT_PLAIN,
                    message.getBytes());

            channelResult.close();

            System.out.println(" [x] Done");



        }
    }

    private static String getMessage(String[] strings){
        if (strings.length < 1)
            return "Hello World!";
        return joinStrings(strings, " ");
    }

    private static String joinStrings(String[] strings, String delimiter) {
        int length = strings.length;
        if (length == 0) return "";
        StringBuilder words = new StringBuilder(strings[0]);
        for (int i = 1; i < length; i++) {
            words.append(delimiter).append(strings[i]);
        }
        return words.toString();
    }
}
